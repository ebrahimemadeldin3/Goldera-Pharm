"use client";

import type { CSSProperties, ReactNode, Ref, UIEventHandler } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FormDrawerWidth = "sm" | "md" | "lg" | "xl";

type FormDrawerSection = {
  id: string;
  label: string;
  description?: string;
};

type FormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  icon?: ReactNode;
  headerExtra?: ReactNode;
  width?: FormDrawerWidth;
  trigger?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  sections?: FormDrawerSection[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  bodyRef?: Ref<HTMLDivElement>;
  onBodyScroll?: UIEventHandler<HTMLDivElement>;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeLabel?: string;
};

const widthClassNames: Record<FormDrawerWidth, string> = {
  sm: "sm:!w-[min(420px,calc(100vw-24px))] sm:!max-w-[420px]",
  md: "sm:!w-[min(520px,calc(100vw-24px))] sm:!max-w-[520px]",
  lg: "sm:!w-[min(600px,85vw)] sm:!max-w-[600px]",
  xl: "sm:!w-[min(680px,85vw)] sm:!max-w-[680px]",
};

export function FormDrawer({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  icon,
  headerExtra,
  width = "lg",
  trigger,
  children,
  footer,
  sections,
  activeSection,
  onSectionChange,
  bodyRef,
  onBodyScroll,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  closeLabel,
}: FormDrawerProps) {
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-drawer-title`;
  const descriptionId = description ? `${titleId}-description` : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="right"
        hideCloseButton
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        overlayClassName="gp-form-drawer-overlay"
        className={cn(
          "gp-form-drawer border-gp-border-default shadow-gp-dialog !h-[100dvh] !w-full gap-0 overflow-hidden border-l bg-white p-0",
          widthClassNames[width],
          className,
        )}
      >
        <SheetHeader
          className={cn(
            "gp-form-drawer-header border-gp-border-subtle shrink-0 border-b bg-white px-5 py-5 text-left sm:px-6",
            headerClassName,
          )}
        >
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              {icon && (
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-11 shrink-0 items-center justify-center rounded-[12px] border">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-gp-gold-700 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                    {eyebrow}
                  </p>
                )}
                <SheetTitle
                  id={titleId}
                  className="text-gp-navy-900 text-xl leading-7 font-semibold"
                >
                  {title}
                </SheetTitle>
                {description && (
                  <SheetDescription
                    id={descriptionId}
                    className="text-gp-text-muted mt-1 max-w-[460px] text-sm leading-6 font-medium"
                  >
                    {description}
                  </SheetDescription>
                )}
                {headerExtra}
              </div>
            </div>

            <SheetClose asChild>
              <button
                type="button"
                aria-label={closeLabel ?? `Close ${title}`}
                className="text-gp-text-muted hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/25 inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-[var(--motion-fast)] ease-[var(--ease-premium)] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {sections && sections.length > 0 && (
          <nav
            className="gp-form-drawer-nav border-gp-border-subtle shrink-0 border-b bg-white px-4 py-3 sm:px-6"
            aria-label={`${title} sections`}
          >
            <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(128px,1fr))]">
              {sections.map((section, index) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => onSectionChange?.(section.id)}
                    className={cn(
                      "focus-visible:ring-gp-gold-500/25 min-h-10 rounded-[10px] border px-3 py-2 text-left transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)] ease-[var(--ease-premium)] focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                      isActive
                        ? "border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900"
                        : "border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted hover:border-gp-gold-300 hover:text-gp-navy-900",
                    )}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-gp-gold-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{section.label}</span>
                    </span>
                    {section.description && (
                      <span className="text-gp-text-muted mt-0.5 block truncate text-[11px] font-medium">
                        {section.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <div
          ref={bodyRef}
          onScroll={onBodyScroll}
          className={cn(
            "gp-form-drawer-body bg-gp-surface-page min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6",
            bodyClassName,
          )}
          style={
            {
              "--gp-form-drawer-bottom-fade": footer ? "1" : "0",
            } as CSSProperties
          }
        >
          {children}
        </div>

        {footer && (
          <footer
            className={cn(
              "gp-form-drawer-footer border-gp-border-subtle shrink-0 border-t bg-white px-5 py-4 sm:px-6",
              footerClassName,
            )}
          >
            {footer}
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
