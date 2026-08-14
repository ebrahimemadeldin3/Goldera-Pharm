"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./sidebar-content";

const COLLAPSE_STORAGE_KEY = "goldera:sidebar:collapsed";

const collapseListeners = new Set<() => void>();

function readStoredCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeCollapsed(callback: () => void) {
  collapseListeners.add(callback);
  return () => {
    collapseListeners.delete(callback);
  };
}

function writeStoredCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Ignore storage access errors (e.g. private mode).
  }
  collapseListeners.forEach((listener) => listener());
}

export function AppSidebar() {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readStoredCollapsed,
    () => false,
  );

  const handleCollapsedChange = useCallback((next: boolean) => {
    writeStoredCollapsed(next);
  }, []);

  return (
    <aside
      className={cn(
        "premium-sidebar border-nav-border bg-nav-surface sticky top-0 z-30 hidden h-dvh max-h-dvh shrink-0 overflow-hidden border-r transition-[width] duration-[var(--motion-slow)] ease-[var(--ease-premium)] xl:block",
        collapsed ? "w-[76px]" : "w-[252px]",
      )}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <SidebarContent
          variant="desktop"
          collapsed={collapsed}
          onCollapsedChange={handleCollapsedChange}
        />
      </div>
    </aside>
  );
}
