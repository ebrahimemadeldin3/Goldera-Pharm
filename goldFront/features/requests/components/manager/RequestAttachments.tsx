"use client";

import { Copy, ExternalLink, FileText, Paperclip } from "lucide-react";
import Link from "next/link";
import type { TRequest } from "@/features/requests/lib/types";
import { toast } from "@/lib/utils/toast";

type RequestAttachmentsProps = {
  request: TRequest;
};

export function RequestAttachments({ request }: RequestAttachmentsProps) {
  const pdfs = request.pdfs ?? [];

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success({
        title: "Link copied",
        description: "File URL copied to clipboard",
      });
    } catch {
      toast.error({
        title: "Copy failed",
        description: "Could not copy file URL",
      });
    }
  }

  return (
    <section>
      <div className="flex items-center gap-2.5">
        <Paperclip
          className="requests-section-head-icon text-gp-gold-600 size-3.5"
          aria-hidden="true"
        />
        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
          Attachments
        </p>
        {pdfs.length > 0 && (
          <span className="text-gp-text-muted text-xs font-medium">
            {pdfs.length} {pdfs.length === 1 ? "file" : "files"}
          </span>
        )}
      </div>

      {pdfs.length === 0 ? (
        <div className="border-gp-border-subtle bg-gp-surface-subtle mt-3 rounded-[12px] border border-dashed px-4 py-5 text-center">
          <span className="bg-gp-surface-control text-gp-text-muted mx-auto flex size-10 items-center justify-center rounded-full">
            <FileText className="size-4.5" aria-hidden="true" />
          </span>
          <p className="text-gp-navy-900 mt-2 text-sm font-semibold">
            No attachments
          </p>
          <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
            No supporting documents were included with this request.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {pdfs.map((pdf) => (
            <div
              key={pdf.public_id}
              className="requests-file-card bg-gp-surface-card border-gp-border-control flex flex-col gap-3 rounded-[10px] border p-3 sm:flex-row sm:items-center"
            >
              <span className="text-gp-danger bg-gp-danger-soft flex size-9 shrink-0 items-center justify-center rounded-[8px]">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gp-navy-900 truncate text-sm leading-5 font-semibold">
                  {pdf.name || "Document"}
                </p>
                <p className="text-gp-text-muted text-xs font-medium">
                  PDF document
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${pdf.name || "attachment"}`}
                  className="requests-primary-file-button bg-gp-navy-900 focus-visible:ring-gp-gold-500/30 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(16,29,54,0.18)] transition-[border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none"
                >
                  <ExternalLink
                    className="text-gp-gold-500 size-3.5"
                    aria-hidden="true"
                  />
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => copyLink(pdf.url)}
                  aria-label={`Copy link for ${pdf.name || "attachment"}`}
                  title="Copy file link"
                  className="requests-file-button border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/20 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] border bg-white px-2.5 text-xs font-semibold shadow-none transition-[border-color,color,background-color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
