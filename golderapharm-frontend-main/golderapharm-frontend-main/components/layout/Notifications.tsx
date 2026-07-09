import { Bell, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { NotificationItem } from "@/features/auth/lib/types";
import IconByType from "@/features/auth/lib/utils/IconByType";

const NOTIFICATIONS: NotificationItem[] = [];

const Notifications = () => {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
  const isEmpty = NOTIFICATIONS.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          title="Notifications"
          className="relative cursor-pointer rounded-full border-0 p-2 outline-0 hover:bg-gray-100"
        >
          <Bell className="text-secondary-dark" size={24} />
          {unreadCount > 0 && (
            <span className="bg-dashboard-red absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[12px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal >
        <DropdownMenuContent
          // align="start"
          side="bottom"
          className="notify-panel -mr-37 mt-8 w-[345px] overflow-hidden rounded-xl border bg-white p-0 shadow-lg"
        >
          {/* Header (always shown) */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="" size={24} />
              <h4 className="text-[18px] font-semibold text-gray-900">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="bg-dashboard-red ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[12px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              aria-label="Close notifications"
              className="rounded-full p-1 text-gray-500 hover:bg-gray-50"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action row: shown only when there are notifications */}
          {!isEmpty && (
            <>
              <div className="text-secondary-dark flex items-center justify-between px-4 py-2 text-sm">
                <button className="cursor-pointer text-left text-sm hover:underline">
                  Mark all as read
                </button>
                <button className="cursor-pointer text-sm hover:underline">
                  Clear all
                </button>
              </div>

              <DropdownMenuSeparator />
            </>
          )}

          {/* Content */}
          <div
            className={`max-h-80 overflow-x-hidden overflow-y-auto ${isEmpty ? "" : ""}`}
          >
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <Bell className="" size={24} />
                <p className="text-secondary-dark text-sm font-normal">
                  No notifications
                </p>
              </div>
            ) : (
              <DropdownMenuGroup>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id}>
                    <DropdownMenuItem
                      className={`relative flex gap-3 px-4 py-4 hover:bg-gray-50 ${
                        n.unread ? "bg-light-warning hover:bg-yellow-50" : ""
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          n.unread ? "bg-amber-100" : "bg-slate-100"
                        }`}
                      >
                        {IconByType(n.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {n.title}
                          </span>
                          <span className="text-secondary-dark text-xs">
                            {n.time}
                          </span>
                        </div>

                        <p className="text-secondary-dark mt-1 text-sm">
                          {n.message}
                        </p>
                      </div>

                      {n.unread && (
                        <span className="ml-3 inline-block h-2 w-2 self-start rounded-full bg-rose-500" />
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-0 py-0" />
                  </div>
                ))}
              </DropdownMenuGroup>
            )}
          </div>

          {/* Footer action: show only when there are notifications */}
          {!isEmpty && (
            <>
              <DropdownMenuSeparator />
              <div className="px-4 py-3">
                <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  View All Notifications
                </button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

export default Notifications;
