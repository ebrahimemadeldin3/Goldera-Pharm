"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";

export function SidebarMenu() {
  const [open, setOpen] = useState(false);
  const drawerId = "mobile-sidebar-navigation";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="shrink-0 cursor-pointer" asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-controls={drawerId}
          aria-expanded={open}
          className="border-nav-border text-nav-muted hover:bg-nav-hover hover:text-brand-gold-dark focus-visible:ring-brand-gold/35 flex size-10 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none xl:hidden"
        >
          <Menu size={20} aria-hidden="true" />
          <span className="sr-only">Toggle menu</span>
        </button>
      </SheetTrigger>
      <SheetContent
        id={drawerId}
        side="left"
        hideCloseButton
        className="premium-sidebar premium-sidebar-drawer border-nav-border bg-nav-surface w-[min(320px,calc(100vw-24px))] gap-0 p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation menu</SheetDescription>
        </SheetHeader>

        <div className="flex h-full min-h-0 flex-col">
          <SidebarContent variant="mobile" onLinkClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
