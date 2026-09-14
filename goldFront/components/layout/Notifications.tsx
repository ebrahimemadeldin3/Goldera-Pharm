"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import type { NotificationItem } from "@/features/auth/lib/types";

const NOTIFICATIONS: NotificationItem[] = [];
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
    <div className="space-y-0 divide-y divide-gp-border-subtle">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3.5">
          <div className="size-10 shrink-0 animate-pulse rounded-[12px] bg-gp-surface-control" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-gp-surface-control" />
            <div className="h-3 w-full animate-pulse rounded-full bg-gp-surface-control" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-gp-surface-control" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-[14px] border border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-gp-navy-900">
          No notifications yet.
        </p>
        <p className="mt-1 max-w-[280px] text-sm leading-5 text-gp-text-muted">
          You will see updates here when something needs your attention.
        </p>
      </div>
    </div>
  );
}

function NotificationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-5 py-8 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-[13px] border border-gp-danger-border bg-gp-danger-soft text-gp-danger">
        <CircleAlert className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-gp-navy-900">
        Notifications unavailable
      </p>
      <p className="mx-auto mt-1 max-w-[280px] text-sm leading-5 text-gp-text-muted">
        We could not load notifications right now.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-gp-border-control bg-white px-3 text-sm font-semibold text-gp-navy-900 transition-colors hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none"
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
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
}) {
  const tone = NOTIFICATION_TONES[notification.type] ?? NOTIFICATION_TONES.alert;
  const Icon = tone.icon;
  const isUnread = Boolean(notification.unread);
  const formattedTime = formatNotificationTime(notification.time);

  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={cn(
        "group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-3.5 text-left transition-colors duration-[150ms] focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none",
        isUnread
          ? "bg-gp-gold-50/70 hover:bg-gp-gold-50"
          : "bg-white hover:bg-gp-surface-control",
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
              "min-w-0 truncate text-sm text-gp-navy-900",
              isUnread ? "font-semibold" : "font-medium",
            )}
          >
            {notification.title}
          </span>
          {formattedTime && (
            <span className="shrink-0 text-xs font-medium text-gp-text-muted">
              {formattedTime}
            </span>
          )}
        </span>
        <span className="mt-1 line-clamp-2 text-sm leading-5 text-gp-text-muted">
          {notification.message}
        </span>
      </span>

      <span className="mt-2 flex size-4 items-center justify-center">
        {isUnread ? (
          <span
            className="size-2 rounded-full bg-gp-gold-500"
            aria-label="Unread"
          />
        ) : (
          <Check
            className="size-3.5 text-gp-text-placeholder opacity-0 transition-opacity group-hover:opacity-100"
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
}) {
  const isEmpty = notifications.length === 0;
  const hasUnread = unreadCount > 0;

  return (
    <div className="flex max-h-[min(620px,calc(100dvh-96px))] flex-col overflow-hidden bg-white sm:max-h-[min(620px,calc(100dvh-96px))]">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gp-border-subtle px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gp-navy-900">
            Notifications
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gp-text-muted">
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
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold text-gp-gold-700 transition-colors hover:bg-gp-gold-50 focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
            className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] text-gp-text-muted transition-colors hover:bg-gp-surface-control hover:text-gp-navy-900 focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none"
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
          <div className="divide-y divide-gp-border-subtle">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={onMarkRead}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "shrink-0 border-t border-gp-border-subtle bg-gp-surface-subtle px-4 py-3",
          mobile && "pb-[calc(env(safe-area-inset-bottom)+12px)]",
        )}
      >
        <p className="text-xs font-medium text-gp-text-muted">
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
  const [notifications, setNotifications] = useState(() =>
    dedupeNotifications(NOTIFICATIONS),
  );
  const [state] = useState<NotificationState>("idle");
  const [markingAll, setMarkingAll] = useState(false);
  const isMobile = useIsMobile();
  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );
  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : "";

  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id && notification.unread
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    setNotifications((current) =>
      current.map((notification) =>
        notification.unread ? { ...notification, unread: false } : notification,
      ),
    );
    setMarkingAll(false);
    toast.success({ title: "Notifications marked as read." });
  }

  function retryNotifications() {
    setNotifications(dedupeNotifications(NOTIFICATIONS));
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
      className="relative flex size-10 cursor-pointer items-center justify-center rounded-[12px] border border-gp-border-default bg-white text-gp-navy-900 shadow-none transition-[background-color,border-color,color,box-shadow] duration-[150ms] hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none"
    >
      <Bell className="size-[18px]" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-gp-gold-500 px-1.5 py-0.5 text-[11px] leading-4 font-bold text-gp-navy-900">
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
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          hideCloseButton
          overlayClassName="bg-gp-navy-900/45"
          className="max-h-[85dvh] gap-0 overflow-hidden rounded-t-[18px] border-gp-border-default bg-white p-0 shadow-gp-dialog"
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[16px] border-gp-border-default bg-white p-0 shadow-gp-popover"
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}

export default Notifications;
