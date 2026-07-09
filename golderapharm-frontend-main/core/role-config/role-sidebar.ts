import { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  LayoutDashboard,
  Users,
  BriefcaseMedical,
  UserSearch,
  MapPin,
  ChartColumnBig,
  TextSearch,
  UserRound,
  ListChecks,
  Settings,
  Target,
  Route,
  LucideProps,
  PackageSearch,
  ClipboardList,
  Store,
  TrendingUp,
  Package,
} from "lucide-react";
import { UserRole } from "@/lib/types";

export type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">> &
    RefAttributes<SVGSVGElement>;
  disabled?: boolean;
};

export const roleSidebarMap: Record<UserRole, SidebarItem[]> = {
  MANAGER: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/manager",
      icon: LayoutDashboard,
    },
    { id: "team", label: "Team", href: "/manager/team", icon: Users },
    {
      id: "doctors",
      label: "Doctors",
      href: "/manager/doctors",
      icon: BriefcaseMedical,
    },
    {
      id: "hr",
      label: "Human Resource",
      href: "/manager/hr",
      icon: UserSearch,
    },
    { id: "visits", label: "Visits", href: "/manager/visits", icon: MapPin },
    {
      id: "requests",
      label: "Requests",
      href: "/manager/requests",
      icon: ClipboardList,
    },
    {
      id: "reports",
      label: "Reports",
      href: "/manager/reports",
      icon: ChartColumnBig,
    },
    {
      id: "appraisal",
      label: "Appraisal",
      href: "/manager/appraisal",
      icon: TextSearch,
    },
    {
      id: "coaching",
      label: "Coaching",
      href: "/manager/coaching",
      icon: ListChecks,
    },
    { id: "plan", label: "Plan", href: "/manager/plan", icon: Route },
    {
      id: "forecast",
      label: "Forecast",
      href: "/manager/forecast",
      icon: PackageSearch,
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      href: "/manager/pharmacies",
      icon: Store,
    },
    {
      id: "sales",
      label: "Sales",
      href: "/manager/sales",
      icon: TrendingUp,
    },
    {
      id: "products",
      label: "Products",
      href: "/manager/products",
      icon: Package,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/manager/profile",
      icon: UserRound,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/manager/settings",
      icon: Settings,
      disabled: true,
    },
  ],
  SUPERVISOR: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/supervisor",
      icon: LayoutDashboard,
    },
    { id: "team", label: "Team", href: "/supervisor/team", icon: Users },
    {
      id: "doctors",
      label: "Doctors",
      href: "/supervisor/doctors",
      icon: BriefcaseMedical,
    },
    { id: "visits", label: "Visits", href: "/supervisor/visits", icon: MapPin },
    {
      id: "reports",
      label: "Reports",
      href: "/supervisor/reports",
      icon: ChartColumnBig,
    },
    {
      id: "requests",
      label: "Requests",
      href: "/supervisor/requests",
      icon: UserSearch,
    },
    {
      id: "coaching",
      label: "Coaching",
      href: "/supervisor/coaching",
      icon: ListChecks,
    },
    {
      id: "forecast",
      label: "Forecast",
      href: "/supervisor/forecast",
      icon: PackageSearch,
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      href: "/supervisor/pharmacies",
      icon: Store,
    },
    // {
    //   id: "sales",
    //   label: "Sales",
    //   href: "/supervisor/sales",
    //   icon: TrendingUp,
    // },
    {
      id: "products",
      label: "Products",
      href: "/supervisor/products",
      icon: Package,
    },
    // {
    //   id: "territory",
    //   label: "Territory Map",
    //   href: "/supervisor/territory",
    //   icon: MapPinned,
    // },
    { id: "plan", label: "Plan", href: "/supervisor/plan", icon: Route },
    {
      id: "profile",
      label: "Profile",
      href: "/supervisor/profile",
      icon: UserRound,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/supervisor/settings",
      icon: Settings,
      disabled: true,
    },
  ],
  MEDICAL_REP: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/rep",
      icon: LayoutDashboard,
    },
    {
      id: "doctors",
      label: "Doctors",
      href: "/rep/doctors",
      icon: BriefcaseMedical,
    },
    { id: "visits", label: "Visits", href: "/rep/visits", icon: MapPin },
    {
      id: "reports",
      label: "Reports",
      href: "/rep/reports",
      icon: ChartColumnBig,
    },
    {
      id: "requests",
      label: "Requests",
      href: "/rep/requests",
      icon: UserSearch,
    },
    {
      id: "target",
      label: "Target",
      href: "/rep/target",
      icon: Target,
      disabled: true,
    },
    {
      id: "coaching",
      label: "Coaching",
      href: "/rep/coaching",
      icon: ListChecks,
    },
    { id: "plan", label: "Plan", href: "/rep/plan", icon: Route },
    {
      id: "forecast",
      label: "Forecast",
      href: "/rep/forecast",
      icon: PackageSearch,
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      href: "/rep/pharmacies",
      icon: Store,
    },
    {
      id: "sales",
      label: "Sales",
      href: "/rep/sales",
      icon: TrendingUp,
    },
    {
      id: "products",
      label: "Products",
      href: "/rep/products",
      icon: Package,
    },
    { id: "profile", label: "Profile", href: "/rep/profile", icon: UserRound },
    {
      id: "settings",
      label: "Settings",
      href: "/rep/settings",
      icon: Settings,
      disabled: true,
    },
  ],
};
