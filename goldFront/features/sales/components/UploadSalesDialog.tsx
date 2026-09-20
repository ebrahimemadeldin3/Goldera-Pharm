"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDrawer } from "@/components/shared/FormDrawer";
import {
  Upload,
  Loader2,
  FileSpreadsheet,
  X,
  CheckCircle2,
} from "lucide-react";
import { uploadSalesAction } from "../api";
import { toast } from "@/lib/utils/toast";

const acceptedExtensions = [".xlsx", ".xls", ".csv"];

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => lowerName.endsWith(extension));
}

export function UploadSalesDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (file && !isAcceptedFile(file)) {
      toast.error({ title: "Please choose a supported spreadsheet file" });
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error({ title: "Please select an Excel file" });
      return;
    }
    if (!sheetName.trim()) {
      toast.error({ title: "Please enter sheet name" });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sheetName", sheetName.trim());

      const result = await uploadSalesAction(formData);
      if (result.success) {
        toast.success({ title: "Sales data uploaded successfully" });
        setOpen(false);
        setSelectedFile(null);
        setSheetName("");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        toast.error({
          title: "Couldn't upload sales data",
          description: result.error?.message || "Check the file and try again.",
        });
      }
    });
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={setOpen}
      title="Upload Sales Data"
      eyebrow="Upload Sales Data"
      description="Upload sales records from a supported spreadsheet."
      icon={<FileSpreadsheet className="size-5" aria-hidden="true" />}
      width="md"
      trigger={
        <Button className="group bg-gp-navy-900 hover:bg-gp-navy-900/95 inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] border border-transparent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-all duration-[170ms] hover:-translate-y-px focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/20 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto">
          <Upload className="text-gp-gold-500 h-4 w-4 transition-transform duration-[170ms] group-hover:-translate-y-0.5" />
          Upload Sales
        </Button>
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-gp-border-control text-gp-navy-900 hover:bg-gp-surface-hover h-10 cursor-pointer rounded-[10px] text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="sales-upload-form"
            disabled={isPending || !selectedFile || !sheetName.trim()}
            className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)]"
          >
            {isPending ? (
              <Loader2 className="text-gp-gold-500 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="text-gp-gold-500 h-4 w-4" />
            )}
            Upload Sales
          </Button>
        </div>
      }
    >
      <form
        id="sales-upload-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="text-gp-navy-900 mb-2 block text-sm font-semibold">
            Sheet Name
          </label>
          <Input
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="e.g. first sheet"
            disabled={isPending}
            className="border-gp-border-control bg-gp-surface-card focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-11 rounded-[10px] text-sm font-medium"
          />
        </div>

        <div>
          <label className="text-gp-navy-900 mb-2 block text-sm font-semibold">
            Spreadsheet File
          </label>
          <div
            className="border-gp-border-control bg-gp-surface-card hover:border-gp-gold-300 hover:bg-gp-gold-50/40 relative flex cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed p-8 text-center transition-[background-color,border-color,transform] duration-[170ms] hover:-translate-y-px"
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex w-full items-center justify-between gap-3 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-10 shrink-0 items-center justify-center rounded-[10px] border">
                    <FileSpreadsheet size={18} className="shrink-0" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-gp-navy-900 block max-w-55 truncate text-sm font-semibold">
                      {selectedFile.name}
                    </span>
                    <span className="text-gp-text-muted mt-0.5 block text-xs font-medium">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  className="text-gp-text-muted hover:bg-gp-danger-soft hover:text-gp-danger inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 mb-3 flex size-12 items-center justify-center rounded-[12px] border">
                  <Upload size={22} />
                </span>
                <p className="text-gp-navy-900 text-sm font-semibold">
                  Drag and drop file
                </p>
                <p className="text-gp-text-muted mt-1 text-xs font-medium">
                  or choose file
                </p>
                <p className="text-gp-text-muted mt-3 text-xs">
                  Supports .xlsx, .xls, .csv
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="border-gp-border-subtle bg-gp-surface-card rounded-[14px] border p-4">
          <p className="text-gp-navy-900 text-sm font-semibold">
            Upload status
          </p>
          <div className="mt-3 space-y-2">
            {["Validating file", "Uploading", "Processing", "Completed"].map(
              (label, index) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs font-semibold"
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full border ${
                      index === 0 && selectedFile
                        ? "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700"
                        : "border-gp-border-control text-gp-text-muted bg-white"
                    }`}
                  >
                    {index === 0 && selectedFile ? (
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="text-gp-text-muted">{label}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </form>
    </FormDrawer>
  );
}
