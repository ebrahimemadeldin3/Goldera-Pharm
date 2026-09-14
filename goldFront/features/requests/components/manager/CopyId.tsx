"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyIdProps = {
  value: string;
  displayValue?: string;
  className?: string;
  ariaLabel?: string;
};

export function CopyId({
  value,
  displayValue,
  className,
  ariaLabel,
}: CopyIdProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      {displayValue !== "" && (
        <code
          className="text-gp-navy-900 min-w-0 truncate font-mono text-xs font-semibold"
          title={value}
        >
          {displayValue ?? value}
        </code>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied to clipboard" : ariaLabel ?? "Copy"}
            className={cn(
              "requests-copy-btn inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-[border-color,color,background-color,box-shadow,transform] duration-[190ms] focus-visible:ring-gp-gold-500/25 focus-visible:ring-3 focus-visible:outline-none",
              copied
                ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                : "border-gp-border-control bg-white text-gp-text-muted",
            )}
          >
            {copied ? (
              <Check className="size-3" aria-hidden="true" />
            ) : (
              <Copy className="size-3" aria-hidden="true" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gp-navy-900 text-white">
          {copied ? "Copied" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
