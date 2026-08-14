"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import { NotificationItem } from "@/features/auth/lib/types";
import IconByType from "@/features/auth/lib/utils/IconByType";

const NOTIFICATIONS: NotificationItem[] = [];

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
  const isEmpty = NOTIFICATIONS.length === 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="border-nav-border text-nav-muted hover:bg-nav-hover hover:text-brand-gold-dark focus-visible:ring-brand-gold/35 relative flex size-10 cursor-pointer items-center justify-center rounded-xl border bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="premium-notification-badge bg-dashboard-red absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="premium-profile-menu border-nav-border w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl bg-white p-0 shadow-[0_18px_44px_rgba(32,36,45,0.16)]"
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="bg-brand-gold-soft text-brand-gold-dark flex size-9 items-center justify-center rounded-xl">
              <Bell size={18} aria-hidden="true" />
            </span>
            <div>
              <h4 className="text-nav-text text-base font-semibold">
                Notifications
              </h4>
              <p className="text-nav-muted text-xs">
                {isEmpty
                  ? "No updates at the moment"
                  : `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="text-nav-muted hover:bg-nav-hover hover:text-brand-gold-dark focus-visible:ring-brand-gold/35 flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <DropdownMenuSeparator className="bg-nav-border my-0" />

        <div className="max-h-80 overflow-x-hidden overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <span className="bg-secondary-very-light text-nav-muted flex size-12 items-center justify-center rounded-2xl">
                <Bell size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-nav-text text-sm font-semibold">
                  You are all caught up
                </p>
                <p className="text-nav-muted mt-1 text-sm">
                  New CRM updates will appear here when available.
                </p>
              </div>
            </div>
          ) : (
            <DropdownMenuGroup>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id}>
                  <div
                    className={`relative flex gap-3 px-4 py-4 ${
                      n.unread ? "bg-nav-active" : ""
                    }`}
                  >
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${
                        n.unread
                          ? "bg-brand-gold-soft text-brand-gold-dark"
                          : "text-nav-muted bg-slate-100"
                      }`}
                    >
                      {IconByType(n.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-nav-text truncate text-sm font-semibold">
                          {n.title}
                        </span>
                        <span className="text-nav-muted shrink-0 text-xs">
                          {n.time}
                        </span>
                      </div>

                      <p className="text-nav-muted mt-1 line-clamp-2 text-sm">
                        {n.message}
                      </p>
                    </div>

                    {n.unread && (
                      <span className="bg-brand-gold mt-1.5 size-2 shrink-0 rounded-full" />
                    )}
                  </div>

                  <DropdownMenuSeparator className="bg-nav-border my-0" />
                </div>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
