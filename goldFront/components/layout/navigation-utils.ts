import { SidebarItem } from "@/core/role-config/role-sidebar";
import { UserRole } from "@/lib/types";
import { isActiveRoute } from "@/lib/utils";

type NavigationGroupDefinition = {
  id: string;
  label: string;
  itemIds: string[];
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: SidebarItem[];
};

const navigationGroupDefinitions: NavigationGroupDefinition[] = [
  {
    id: "main",
    label: "Main",
    itemIds: ["dashboard"],
  },
  {
    id: "field",
    label: "Field Operations",
    itemIds: ["visits", "plan", "doctors", "pharmacies"],
  },
  {
    id: "commercial",
    label: "Commercial",
    itemIds: ["sales", "forecast", "products", "target"],
  },
  {
    id: "management",
    label: "Management",
    itemIds: ["team", "hr", "coaching", "appraisal"],
  },
  {
    id: "workflow",
    label: "Workflow",
    itemIds: ["requests", "reports"],
  },
  {
    id: "account",
    label: "Account",
    itemIds: ["profile", "settings"],
  },
];

const roleLabels: Record<UserRole, string> = {
  MANAGER: "Manager",
  SUPERVISOR: "Supervisor",
  MEDICAL_REP: "Medical Rep",
};

const roleBasePaths: Record<UserRole, string> = {
  MANAGER: "/manager",
  SUPERVISOR: "/supervisor",
  MEDICAL_REP: "/rep",
};

const segmentLabels: Record<string, string> = {
  add: "Add",
  new: "New",
  report: "Report",
  submit: "Submit",
};

export function getRoleLabel(role: UserRole) {
  return roleLabels[role];
}

export function getRoleBasePath(role: UserRole) {
  return roleBasePaths[role];
}

export function getAvailableSidebarItems(sidebar: SidebarItem[]) {
  return sidebar.filter((item) => !item.disabled);
}

export function getSidebarItem(sidebar: SidebarItem[], itemId: string) {
  return getAvailableSidebarItems(sidebar).find((item) => item.id === itemId);
}

export function getNavigationGroups(sidebar: SidebarItem[]): NavigationGroup[] {
  const groupedIds = new Set<string>();

  const groups = navigationGroupDefinitions
    .map((group) => {
      const items = group.itemIds
        .map((id) => sidebar.find((item) => item.id === id))
        .filter((item): item is SidebarItem => Boolean(item));

      items.forEach((item) => groupedIds.add(item.id));

      return {
        id: group.id,
        label: group.label,
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  const remainingItems = sidebar.filter((item) => !groupedIds.has(item.id));

  if (remainingItems.length > 0) {
    groups.push({
      id: "more",
      label: "More",
      items: remainingItems,
    });
  }

  return groups;
}

export function getActiveSidebarItem(pathname: string, sidebar: SidebarItem[]) {
  const availableItems = getAvailableSidebarItems(sidebar);

  return (
    availableItems
      .filter((item) => isActiveRoute(pathname, item.href, availableItems))
      .sort((left, right) => right.href.length - left.href.length)[0] ??
    availableItems[0]
  );
}

function formatSegment(segment: string) {
  if (segmentLabels[segment]) return segmentLabels[segment];
  if (/^[a-f0-9-]{8,}$/i.test(segment)) return "Details";

  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getPageContext(pathname: string, sidebar: SidebarItem[]) {
  const activeItem = getActiveSidebarItem(pathname, sidebar);
  const groups = getNavigationGroups(sidebar);
  const group = groups.find((itemGroup) =>
    itemGroup.items.some((item) => item.id === activeItem?.id),
  );

  const pathSegments = pathname.split("/").filter(Boolean);
  const activeSegments = activeItem?.href.split("/").filter(Boolean) ?? [];
  const nestedSegments = pathSegments
    .slice(activeSegments.length)
    .map(formatSegment);

  const groupLabel = group?.label ?? "Workspace";
  const activeLabel = activeItem?.label ?? "Dashboard";
  const pageTitle =
    nestedSegments.length > 0
      ? `${activeLabel} ${nestedSegments[nestedSegments.length - 1]}`
      : activeLabel;

  return {
    activeItem,
    groupLabel,
    pageTitle,
    breadcrumbs:
      nestedSegments.length > 0
        ? [groupLabel, activeLabel, ...nestedSegments]
        : [groupLabel, activeLabel],
  };
}

export function getShortUserName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) return name;

  const first = parts[0];
  const last = parts[parts.length - 1];
  const second = parts[1];
  const secondToLast = parts[parts.length - 2];
  const suffix =
    last.toLowerCase() !== first.toLowerCase() ? last : secondToLast;
  const shortName = `${first} ${suffix ?? second ?? ""}`.trim();

  return shortName.length <= 24 ? shortName : first;
}
