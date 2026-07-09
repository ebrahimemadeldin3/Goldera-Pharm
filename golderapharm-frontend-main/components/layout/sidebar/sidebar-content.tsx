"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { getInitials, isActiveRoute } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LogoutDialog } from "../logout-dialog";

interface SidebarContentProps {
  onLinkClick?: () => void;
  variant?: "desktop" | "mobile";
}

export function SidebarContent({
  onLinkClick,
  variant = "desktop",
}: SidebarContentProps) {
  const pathname = usePathname() ?? "/manager";
  const { logout, isPending } = useLogout();
  const { sidebar, user, role } = useRoleUI();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-secondary-light to-light-warning flex shrink-0 flex-row items-center gap-3 border bg-linear-to-b from-[#EFF6FF] px-5 py-3">
        <span className="from-system-gradient-from to-system-gradient-to flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-b text-base/6 text-white">
          {getInitials(user.name)}
        </span>
        <div className="flex flex-col">
          <span className="text-sm/5 font-normal text-black">{user.name}</span>
          <span className="bg-system-primary mt-1 inline-block w-fit rounded-full px-4 py-0.5 text-xs/4 font-medium text-white">
            {role === "MANAGER"
              ? "Manager"
              : role === "SUPERVISOR"
                ? "Supervisor"
                : "Medical Rep"}
          </span>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-white">
        <nav className="mt-2 mb-2">
          <ul className="flex flex-col gap-3">
            {sidebar.map((item) => {
              const active = isActiveRoute(pathname, item.href, sidebar);
              const Icon = item.icon;
              const isDisabled = item.disabled === true;

              return (
                <li key={item.id} className="flex justify-start gap-6.5">
                  <div
                    className={`h-9 w-1.5 rounded-tr-[5px] rounded-br-[5px] ${active ? "bg-system-primary" : "bg-transparent"}`}
                  />

                  {isDisabled ? (
                    <div
                      className={`flex w-55.25 cursor-not-allowed items-center gap-2 rounded-[5px] px-4 opacity-50 transition-colors`}
                    >
                      <span
                        className={`text-secondary-dark flex h-8 w-8 items-center justify-center bg-transparent`}
                      >
                        <Icon size={20} />
                      </span>
                      <span
                        className={`text-secondary-dark text-[15px]/5 font-normal`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={`flex w-55.25 items-center gap-2 rounded-[5px] px-4 transition-colors ${
                        active
                          ? variant === "desktop"
                            ? "from-system-gradient-from to-system-gradient-to bg-linear-to-b text-white"
                            : "bg-system-primary text-white"
                          : "hover:bg-system-primary-stroke hover:*:text-system-primary"
                      } cursor-pointer`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center ${
                          active
                            ? "text-white"
                            : "text-secondary-dark bg-transparent"
                        }`}
                      >
                        <Icon size={20} />
                      </span>
                      <span
                        className={`text-[15px]/5 font-normal ${active ? "text-white" : "text-secondary-dark"}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator className="mx-auto max-w-62.5" />

        <button
          className="text-dashboard-red mt-1 ml-11.5 flex w-fit cursor-pointer items-center gap-3 rounded-md px-3 py-3 pr-10 text-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setShowLogoutDialog(true)}
          disabled={isPending}
        >
          <LogOut size={20} />
          <span>{isPending ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-very-light mt-auto w-full shrink-0 border border-[#E2E8F0] py-3 text-center text-[12px]">
        <p className="font-medium text-[#94A3B8]">Goldera Pharma CRM</p>
        <p className="text-[#CBD5E1]">v2.0 © 2025</p>
      </footer>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isPending={isPending}
      />
    </div>
  );
}
