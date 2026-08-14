"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo } from "react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { cn, isActiveRoute } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getAvailableSidebarItems,
  getNavigationGroups,
  getRoleBasePath,
} from "../navigation-utils";
import { SidebarUserMenu } from "./sidebar-user-menu";

interface SidebarContentProps {
  onLinkClick?: () => void;
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarContent({
  onLinkClick,
  variant = "desktop",
  collapsed = false,
  onCollapsedChange,
}: SidebarContentProps) {
  const pathname = usePathname() ?? "/manager";
  const { sidebar, role } = useRoleUI();
  const isCollapsed = variant === "desktop" && collapsed;
  const availableSidebar = useMemo(
    () => getAvailableSidebarItems(sidebar),
    [sidebar],
  );
  const navigationGroups = useMemo(
    () => getNavigationGroups(sidebar),
    [sidebar],
  );
  const dashboardHref = getRoleBasePath(role);

  const collapseLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header
        className={cn(
          "sidebar-brand-header flex shrink-0 border-b transition-all duration-[var(--motion-slow)] ease-[var(--ease-premium)]",
          isCollapsed
            ? "flex-col items-center gap-2 px-3 py-4"
            : "items-center justify-between px-4 py-4",
        )}
      >
        <Link
          href={dashboardHref}
          onClick={onLinkClick}
          aria-label="GolderaPharm dashboard"
          className={cn(
            "sidebar-brand-link focus-visible:ring-brand-gold/35 flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:outline-none",
            isCollapsed ? "justify-center" : "min-w-0 flex-1",
          )}
        >
          <span className="sidebar-logo-shell ring-brand-gold/30 flex size-11 shrink-0 items-center justify-center rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.18)] ring-1">
            <Image
              src="/logos/logo.webp"
              alt="GolderaPharm"
              width={34}
              height={40}
              priority
            />
          </span>
          <span
            className={cn(
              "min-w-0 transition-all duration-[var(--motion-normal)] ease-[var(--ease-premium)]",
              isCollapsed
                ? "w-0 -translate-x-1 overflow-hidden opacity-0"
                : "w-auto translate-x-0 opacity-100",
            )}
          >
            <span className="sidebar-brand-name block truncate text-[15px] leading-tight font-semibold">
              GolderaPharm
            </span>
            <span className="sidebar-brand-subtitle mt-1 block truncate text-[10px] font-semibold tracking-[0.16em] uppercase">
              Pharmaceutical CRM
            </span>
          </span>
        </Link>

        {variant === "desktop" ? (
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={collapseLabel}
                aria-expanded={!isCollapsed}
                aria-controls="desktop-sidebar-navigation"
                onClick={() => onCollapsedChange?.(!isCollapsed)}
                className="premium-collapse-button focus-visible:ring-brand-gold/35 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="relative block size-4">
                  <ChevronLeft
                    className={cn(
                      "premium-collapse-icon absolute inset-0 size-4",
                      isCollapsed
                        ? "scale-75 rotate-90 opacity-0"
                        : "scale-100 rotate-0 opacity-100",
                    )}
                    aria-hidden="true"
                  />
                  <ChevronRight
                    className={cn(
                      "premium-collapse-icon absolute inset-0 size-4",
                      isCollapsed
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-75 -rotate-90 opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </span>
                <span className="sr-only">{collapseLabel}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={isCollapsed ? "right" : "bottom"}
              sideOffset={10}
              className="sidebar-tooltip rounded-lg border text-xs"
            >
              {collapseLabel}
            </TooltipContent>
          </Tooltip>
        ) : (
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="premium-collapse-button focus-visible:ring-brand-gold/35 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:outline-none"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </SheetClose>
        )}
      </header>

      <nav
        id={
          variant === "desktop"
            ? "desktop-sidebar-navigation"
            : "mobile-sidebar-navigation"
        }
        aria-label="Primary navigation"
        data-collapsed={isCollapsed ? "true" : undefined}
        className={cn(
          "premium-nav-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
          isCollapsed ? "px-4 pt-3 pb-4" : "px-3 pt-4 pb-5",
        )}
      >
        <div
          className={cn("relative", isCollapsed ? "space-y-3" : "space-y-5")}
        >
          {navigationGroups.map((group) => (
            <section key={group.id} aria-labelledby={`nav-${group.id}`}>
              <h2
                id={`nav-${group.id}`}
                className={cn(
                  "nav-section-label mb-1.5 overflow-hidden px-3 transition-all duration-[var(--motion-normal)] ease-[var(--ease-premium)]",
                  isCollapsed && "mb-0 h-0 opacity-0",
                )}
              >
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isDisabled = item.disabled === true;
                  const active = isActiveRoute(
                    pathname,
                    item.href,
                    availableSidebar,
                  );
                  const isActive = active && !isDisabled;

                  const itemClassName = cn(
                    "premium-nav-item relative z-20 flex h-10 items-center overflow-hidden rounded-lg text-sm font-medium outline-none transition-[background,color] duration-[var(--motion-fast)] ease-[var(--ease-premium)]",
                    isCollapsed
                      ? "w-11 justify-center px-0"
                      : "w-full gap-3 px-3.5",
                    isActive
                      ? "text-nav-active-text"
                      : "text-nav-normal hover:text-nav-text",
                    isDisabled &&
                      "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-nav-normal",
                    "focus-visible:ring-brand-gold/35 focus-visible:ring-2",
                  );

                  const navItemContent = (
                    <>
                      <Icon
                        className="premium-nav-icon size-[18px] shrink-0"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "premium-nav-label truncate transition-all duration-[var(--motion-normal)] ease-[var(--ease-premium)]",
                          isCollapsed
                            ? "w-0 -translate-x-1 overflow-hidden opacity-0"
                            : "w-auto translate-x-0 opacity-100",
                          isActive && "font-semibold",
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  );

                  const navItem = isDisabled ? (
                    <div
                      className={itemClassName}
                      aria-disabled="true"
                      title={item.label}
                    >
                      {navItemContent}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={itemClassName}
                      aria-current={isActive ? "page" : undefined}
                      data-nav-active={isActive ? "true" : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {navItemContent}
                    </Link>
                  );

                  return (
                    <li key={item.id}>
                      {isCollapsed ? (
                        <Tooltip delayDuration={150}>
                          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={10}
                            className="sidebar-tooltip rounded-lg border text-xs"
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        navItem
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      <SidebarUserMenu collapsed={isCollapsed} onLinkClick={onLinkClick} />
    </div>
  );
}
