"use client";

import { SidebarContent } from "./sidebar-content";

export function AppSidebar() {
  return (
    <aside className="sticky top-[82px] flex h-[calc(100vh-82px)] w-73.25 flex-col overflow-hidden border-r bg-white p-0 max-[1440px]:hidden">
      <SidebarContent variant="desktop" />
    </aside>
  );
}
