"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useState } from "react";
import Notifications from "./Notifications";
import { SidebarMenu } from "@/components/layout/sidebar/sidebar-menu";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutDialog } from "./logout-dialog";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { getInitials } from "@/lib/utils";
import {
  getPageContext,
  getRoleLabel,
  getShortUserName,
  getSidebarItem,
} from "./navigation-utils";

function UserAvatar({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { user } = useRoleUI();
  const sizeClass = size === "sm" ? "size-9" : "size-10";
  const imageSize = size === "sm" ? 36 : 40;

  return (
    <span
      className={`bg-brand-gold-soft text-brand-gold-dark border-brand-gold/25 flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold ${className}`}
    >
      {user.profileImage?.public_id ? (
        <SafeCldImage
          src={user.profileImage.public_id}
          fallbackUrl={user.profileImage.url}
          alt={user.name}
          width={imageSize}
          height={imageSize}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        getInitials(user.name)
      )}
    </span>
  );
}

const Header = () => {
  const pathname = usePathname() ?? "/";
  const { user, role, sidebar } = useRoleUI();
  const { logout, isPending } = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pageContext = getPageContext(pathname, sidebar);
  const profileItem = getSidebarItem(sidebar, "profile");
  const settingsItem = getSidebarItem(sidebar, "settings");
  const shortName = getShortUserName(user.name);
  const contextLabel =
    pageContext.breadcrumbs.length > 2
      ? pageContext.breadcrumbs.slice(0, -1).join(" / ")
      : pageContext.groupLabel;

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className="border-nav-border sticky top-0 z-40 flex h-[70px] shrink-0 items-center justify-between border-b bg-white/95 px-4 shadow-[0_1px_0_rgba(32,36,45,0.04)] backdrop-blur sm:px-6 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarMenu />
          <div className="min-w-0">
            <h1 className="text-nav-text truncate text-base leading-tight font-semibold sm:text-lg">
              {pageContext.pageTitle}
            </h1>
            <p className="text-nav-muted mt-0.5 truncate text-xs leading-tight font-medium">
              {contextLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Notifications />

          <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user menu"
                aria-expanded={profileOpen}
                className="border-nav-border hover:bg-nav-hover focus-visible:ring-brand-gold/35 flex h-11 max-w-[230px] cursor-pointer items-center gap-2 rounded-2xl border bg-white px-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <UserAvatar size="sm" />
                <span className="hidden min-w-0 flex-col sm:flex">
                  <span className="text-nav-text truncate text-sm font-semibold">
                    {shortName}
                  </span>
                  <span className="text-nav-muted truncate text-xs">
                    {getRoleLabel(role)}
                  </span>
                </span>
                <ChevronDown
                  className="text-nav-muted hidden size-4 sm:block"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="premium-profile-menu border-nav-border w-[min(320px,calc(100vw-24px))] rounded-2xl bg-white p-2 shadow-[0_18px_44px_rgba(32,36,45,0.16)]"
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar />
                  <div className="min-w-0">
                    <p className="text-nav-text truncate text-sm font-semibold">
                      {shortName}
                    </p>
                    <p className="text-brand-gold-dark mt-0.5 truncate text-xs font-medium">
                      {getRoleLabel(role)}
                    </p>
                    <p className="text-nav-muted mt-0.5 truncate text-xs font-normal">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              {(profileItem || settingsItem) && (
                <DropdownMenuSeparator className="bg-nav-border" />
              )}

              {profileItem && (
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                  <Link href={profileItem.href}>
                    <UserRound className="size-4" aria-hidden="true" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
              )}

              {settingsItem && (
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                  <Link href={settingsItem.href}>
                    <Settings className="size-4" aria-hidden="true" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-nav-border" />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setProfileOpen(false);
                  setShowLogoutDialog(true);
                }}
                disabled={isPending}
                className="text-dashboard-red focus:text-dashboard-red cursor-pointer rounded-xl"
              >
                <LogOut
                  className="text-dashboard-red size-4"
                  aria-hidden="true"
                />
                {isPending ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isPending={isPending}
      />
    </>
  );
};

export default Header;
