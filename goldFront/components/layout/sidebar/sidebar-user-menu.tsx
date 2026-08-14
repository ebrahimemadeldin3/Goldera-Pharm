"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useState } from "react";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { cn, getInitials } from "@/lib/utils";
import { LogoutDialog } from "../logout-dialog";
import {
  getRoleLabel,
  getShortUserName,
  getSidebarItem,
} from "../navigation-utils";

interface SidebarUserMenuProps {
  collapsed?: boolean;
  onLinkClick?: () => void;
}

function SidebarUserAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { user } = useRoleUI();
  const sizeClass = size === "sm" ? "size-9" : "size-10";
  const imageSize = size === "sm" ? 36 : 40;

  return (
    <span
      className={cn(
        "sidebar-user-avatar flex shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold",
        sizeClass,
        className,
      )}
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

export function SidebarUserMenu({
  collapsed = false,
  onLinkClick,
}: SidebarUserMenuProps) {
  const { user, role, sidebar } = useRoleUI();
  const { logout, isPending } = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const profileItem = getSidebarItem(sidebar, "profile");
  const settingsItem = getSidebarItem(sidebar, "settings");
  const shortName = getShortUserName(user.name);
  const menuLabel = collapsed
    ? "Open account menu"
    : `Open account menu for ${shortName}`;

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={profileOpen}
        className={cn(
          "sidebar-user-trigger focus-visible:ring-brand-gold/35 flex w-full cursor-pointer items-center text-left transition-all duration-[var(--motion-fast)] ease-[var(--ease-premium)] outline-none focus-visible:ring-2",
          collapsed
            ? "h-11 justify-center rounded-xl px-0"
            : "min-h-14 gap-3 rounded-xl px-2.5 py-2",
        )}
      >
        <SidebarUserAvatar size="sm" />
        <span
          className={cn(
            "min-w-0 flex-1 transition-all duration-[var(--motion-normal)] ease-[var(--ease-premium)]",
            collapsed
              ? "w-0 -translate-x-1 overflow-hidden opacity-0"
              : "w-auto translate-x-0 opacity-100",
          )}
        >
          <span className="sidebar-user-name block truncate text-sm font-semibold">
            {shortName}
          </span>
          <span className="sidebar-user-role mt-0.5 block truncate text-xs">
            {getRoleLabel(role)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "sidebar-user-chevron size-4 shrink-0 transition-all duration-[var(--motion-normal)] ease-[var(--ease-premium)]",
            collapsed
              ? "w-0 -translate-x-1 overflow-hidden opacity-0"
              : "w-4 translate-x-0 opacity-100",
          )}
          aria-hidden="true"
        />
      </button>
    </DropdownMenuTrigger>
  );

  return (
    <>
      <footer
        className={cn(
          "sidebar-user-footer shrink-0 border-t transition-all duration-[var(--motion-slow)] ease-[var(--ease-premium)]",
          collapsed ? "px-3 py-3" : "px-3 py-3.5",
        )}
      >
        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
          {collapsed ? (
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>{trigger}</TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={10}
                className="sidebar-tooltip rounded-lg border text-xs"
              >
                {shortName}
              </TooltipContent>
            </Tooltip>
          ) : (
            trigger
          )}

          <DropdownMenuContent
            align="end"
            side={collapsed ? "right" : "top"}
            sideOffset={12}
            className="sidebar-profile-menu w-[min(300px,calc(100vw-24px))] rounded-xl border p-2 shadow-[0_18px_44px_rgba(0,0,0,0.28)]"
          >
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <SidebarUserAvatar />
                <div className="min-w-0">
                  <p className="sidebar-profile-menu-name truncate text-sm font-semibold">
                    {shortName}
                  </p>
                  <p className="sidebar-profile-menu-role mt-0.5 truncate text-xs font-medium">
                    {getRoleLabel(role)}
                  </p>
                  <p className="sidebar-profile-menu-email mt-0.5 truncate text-xs font-normal">
                    {user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            {(profileItem || settingsItem) && (
              <DropdownMenuSeparator className="sidebar-profile-menu-separator" />
            )}

            {profileItem && (
              <DropdownMenuItem
                asChild
                className="sidebar-profile-menu-item cursor-pointer rounded-lg"
              >
                <Link
                  href={profileItem.href}
                  onClick={() => {
                    setProfileOpen(false);
                    onLinkClick?.();
                  }}
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  Profile
                </Link>
              </DropdownMenuItem>
            )}

            {settingsItem && (
              <DropdownMenuItem
                asChild
                className="sidebar-profile-menu-item cursor-pointer rounded-lg"
              >
                <Link
                  href={settingsItem.href}
                  onClick={() => {
                    setProfileOpen(false);
                    onLinkClick?.();
                  }}
                >
                  <Settings className="size-4" aria-hidden="true" />
                  Settings
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="sidebar-profile-menu-separator" />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setProfileOpen(false);
                setShowLogoutDialog(true);
              }}
              disabled={isPending}
              className="sidebar-profile-menu-signout cursor-pointer rounded-lg"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isPending ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isPending={isPending}
      />
    </>
  );
}
