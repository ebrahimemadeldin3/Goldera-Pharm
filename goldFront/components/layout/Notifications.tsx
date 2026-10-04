"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotificationsAction } from "@/features/auth/api/notifications";
import {
  Bell,
  Check,
  CheckCheck,
  CircleAlert,
  CircleCheckBig,
  CornerRightDown,
  FileText,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { NotificationItem } from "@/features/auth/lib/types";

const MOBILE_QUERY = "(max-width: 640px)";

type NotificationState = "idle" | "loading" | "error";

type NotificationTone = {
  icon: LucideIcon;
  shell: string;
  iconClassName: string;
};

const NOTIFICATION_TONES: Record<NotificationItem["type"], NotificationTone> = {
  alert: {
    icon: CircleAlert,
    shell: "bg-gp-warning-soft border-gp-warning-border",
    iconClassName: "text-gp-warning",
  },
  drop: {
    icon: CornerRightDown,
    shell: "bg-gp-gold-50 border-gp-gold-300",
    iconClassName: "text-gp-gold-700",
  },
  success: {
    icon: CircleCheckBig,
    shell: "bg-gp-success-soft border-gp-success-border",
    iconClassName: "text-gp-success",
  },
  file: {
    icon: FileText,
    shell: "bg-gp-surface-subtle border-gp-border-subtle",
    iconClassName: "text-gp-navy-900",
  },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function dedupeNotifications(items: NotificationItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function formatNotificationTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60_000) return "Just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function NotificationSkeleton() {
  return (
    <div className="divide-gp-border-subtle space-y-0 divide-y">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3.5">
          <div className="bg-gp-surface-control size-10 shrink-0 animate-pulse rounded-[12px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-gp-surface-control h-3.5 w-3/5 animate-pulse rounded-full" />
            <div className="bg-gp-surface-control h-3 w-full animate-pulse rounded-full" />
            <div className="bg-gp-surface-control h-3 w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted flex size-12 items-center justify-center rounded-[14px] border">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-gp-navy-900 text-sm font-semibold">
          No notifications yet.
        </p>
        <p className="text-gp-text-muted mt-1 max-w-[280px] text-sm leading-5">
          You will see updates here when something needs your attention.
        </p>
      </div>
    </div>
  );
}

function NotificationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-5 py-8 text-center">
      <span className="border-gp-danger-border bg-gp-danger-soft text-gp-danger mx-auto flex size-11 items-center justify-center rounded-[13px] border">
        <CircleAlert className="size-5" aria-hidden="true" />
      </span>
      <p className="text-gp-navy-900 mt-3 text-sm font-semibold">
        Notifications unavailable
      </p>
      <p className="text-gp-text-muted mx-auto mt-1 max-w-[280px] text-sm leading-5">
        We could not load notifications right now.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/10 mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border bg-white px-3 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
  isRep,
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
  isRep?: boolean;
}) {
  const tone =
    NOTIFICATION_TONES[notification.type] ?? NOTIFICATION_TONES.alert;
  const Icon = tone.icon;
  const isUnread = Boolean(notification.unread);
  const formattedTime = formatNotificationTime(notification.time);

  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={cn(
        "group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-3.5 text-left transition-colors duration-[150ms] focus-visible:ring-3 focus-visible:outline-none",
        isRep
          ? "focus-visible:ring-[#168557]/20"
          : "focus-visible:ring-gp-gold-500/10",
        isUnread
          ? isRep
            ? "bg-[#E9F8F1]/40 hover:bg-[#E9F8F1]/70"
            : "bg-gp-gold-50/70 hover:bg-gp-gold-50"
          : "hover:bg-gp-surface-control bg-white",
      )}
      aria-label={`${notification.title}${isUnread ? ", unread" : ""}`}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-[12px] border",
          tone.shell,
        )}
      >
        <Icon className={cn("size-4", tone.iconClassName)} aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 items-start justify-between gap-2">
          <span
            className={cn(
              "text-gp-navy-900 min-w-0 truncate text-sm",
              isUnread ? "font-semibold" : "font-medium",
            )}
          >
            {notification.title}
          </span>
          {formattedTime && (
            <span className="text-gp-text-muted shrink-0 text-xs font-medium">
              {formattedTime}
            </span>
          )}
        </span>
        <span className="text-gp-text-muted mt-1 line-clamp-2 text-sm leading-5">
          {notification.message}
        </span>
      </span>

      <span className="mt-2 flex size-4 items-center justify-center">
        {isUnread ? (
          <span
            className={cn(
              "size-2 rounded-full",
              isRep ? "bg-[#168557]" : "bg-gp-gold-500",
            )}
            aria-label="Unread"
          />
        ) : (
          <Check
            className="text-gp-text-placeholder size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  );
}

function NotificationPanel({
  notifications,
  unreadCount,
  state,
  markingAll,
  onClose,
  onRetry,
  onMarkRead,
  onMarkAllRead,
  mobile = false,
  isRep = false,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  state: NotificationState;
  markingAll: boolean;
  onClose: () => void;
  onRetry: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  mobile?: boolean;
  isRep?: boolean;
}) {
  const isEmpty = notifications.length === 0;
  const hasUnread = unreadCount > 0;

  return (
    <div className="flex max-h-[min(620px,calc(100dvh-96px))] flex-col overflow-hidden bg-white sm:max-h-[min(620px,calc(100dvh-96px))]">
      <div className="border-gp-border-subtle flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-gp-navy-900 text-base font-semibold">
            Notifications
          </h2>
          <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
            {isEmpty
              ? "No notifications yet"
              : `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasUnread && (
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={markingAll}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                isRep
                  ? "text-[#168557] hover:bg-[#E9F8F1] focus-visible:ring-3 focus-visible:ring-[#168557]/15"
                  : "text-gp-gold-700 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/10 focus-visible:ring-3",
              )}
            >
              {markingAll ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCheck className="size-3.5" aria-hidden="true" />
              )}
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="text-gp-text-muted hover:bg-gp-surface-control hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/10 flex size-8 cursor-pointer items-center justify-center rounded-[9px] transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {state === "loading" ? (
          <NotificationSkeleton />
        ) : state === "error" ? (
          <NotificationsError onRetry={onRetry} />
        ) : isEmpty ? (
          <NotificationsEmpty />
        ) : (
          <div className="divide-gp-border-subtle divide-y">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={onMarkRead}
                isRep={isRep}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "border-gp-border-subtle bg-gp-surface-subtle shrink-0 border-t px-4 py-3",
          mobile && "pb-[calc(env(safe-area-inset-bottom)+12px)]",
        )}
      >
        <p className="text-gp-text-muted text-xs font-medium">
          {state === "idle"
            ? "Updates stay here until they are marked as read."
            : "The notification center is still available."}
        </p>
      </div>
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [state, setState] = useState<NotificationState>("loading");
  const readKey = useRef("");
  const router = useRouter();
  const readIds = useRef(new Set<string>());
  const loadNotifications = useCallback(async () => {
    const result = await getNotificationsAction();
    if (!result.success) {
      setState("error");
      return;
    }
    readKey.current = `goldera:notifications:read:${result.userId}`;
    try {
      readIds.current = new Set(
        JSON.parse(localStorage.getItem(readKey.current) || "[]"),
      );
    } catch {
      readIds.current = new Set();
    }
    setNotifications(
      dedupeNotifications(result.data).map((n) => ({
        ...n,
        unread: !readIds.current.has(n.id),
      })),
    );
    setState("idle");
  }, []);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (active && document.visibilityState === "visible")
        void loadNotifications();
    };
    refresh();
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [loadNotifications]);
  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) void loadNotifications();
  }
  function rememberRead(ids: string[]) {
    ids.forEach((id) => readIds.current.add(id));
    try {
      localStorage.setItem(
        readKey.current,
        JSON.stringify([...readIds.current].slice(-500)),
      );
    } catch {
      /* Read state remains available for this session. */
    }
  }
  const [markingAll, setMarkingAll] = useState(false);
  const isMobile = useIsMobile();
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );
  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : "";

  function markAsRead(id: string) {
    rememberRead([id]);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id && notification.unread
          ? { ...notification, unread: false }
          : notification,
      ),
    );
    const notification = notifications.find((n) => n.id === id);
    if (notification?.href) {
      setOpen(false);
      router.push(notification.href);
    }
  }

  function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    rememberRead(notifications.map((n) => n.id));
    setNotifications((current) =>
      current.map((notification) =>
        notification.unread ? { ...notification, unread: false } : notification,
      ),
    );
    setMarkingAll(false);
    toast.success({ title: "Notifications marked as read." });
  }

  function retryNotifications() {
    setState("loading");
    void loadNotifications();
  }

  const trigger = (
    <button
      type="button"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      title="Notifications"
      className={cn(
        "border-gp-border-default text-gp-navy-900 relative flex size-10 cursor-pointer items-center justify-center rounded-[12px] border bg-white shadow-none transition-[background-color,border-color,color,box-shadow] duration-[150ms] focus-visible:outline-none",
        isRep
          ? "hover:bg-gp-surface-hover hover:border-[#168557]/40 hover:text-[#168557] focus-visible:ring-3 focus-visible:ring-[#168557]/15"
          : "hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/10 focus-visible:ring-3",
      )}
    >
      <Bell className="size-[18px]" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 font-bold",
            isRep
              ? "bg-[#168557] text-white"
              : "bg-gp-gold-500 text-gp-navy-900",
          )}
        >
          {badgeLabel}
        </span>
      )}
    </button>
  );

  const panel = (
    <NotificationPanel
      notifications={notifications}
      unreadCount={unreadCount}
      state={state}
      markingAll={markingAll}
      onClose={() => setOpen(false)}
      onRetry={retryNotifications}
      onMarkRead={markAsRead}
      onMarkAllRead={markAllAsRead}
      mobile={isMobile}
      isRep={isRep}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={changeOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          hideCloseButton
          overlayClassName="bg-gp-navy-900/45"
          className="border-gp-border-default shadow-gp-dialog max-h-[85dvh] gap-0 overflow-hidden rounded-t-[18px] bg-white p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {panel}
          <SheetFooter className="hidden" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="border-gp-border-default shadow-gp-popover w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[16px] bg-white p-0"
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}

export default Notifications;
