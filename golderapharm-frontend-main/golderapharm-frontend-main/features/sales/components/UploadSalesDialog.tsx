"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, FileSpreadsheet, X } from "lucide-react";
import { uploadSalesAction } from "../api";
import { toast } from "sonner";

export function UploadSalesDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an Excel file");
      return;
    }
    if (!sheetName.trim()) {
      toast.error("Please enter sheet name");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sheetName", sheetName.trim());

      const result = await uploadSalesAction(formData);
      if (result.success) {
        toast.success("Sales data uploaded successfully");
        setOpen(false);
        setSelectedFile(null);
        setSheetName("");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to upload sales data");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-system-primary hover:text-system-primary hover:border-system-primary ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-transparent">
          <Upload className="h-4 w-4" />
          Upload Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={18} />
            Upload Sales Data
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">
              Sheet Name
            </label>
            <Input
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="e.g. first sheet"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">
              Excel File (.xlsx, .xls, .csv)
            </label>
            <div
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-8 transition-colors hover:border-[#2563EB]"
              onClick={() => inputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet
                      size={20}
                      className="text-dashboard-green shrink-0"
                    />
                    <span className="max-w-55 truncate text-sm font-medium text-black">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-secondary-dark hover:text-red-500"
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
                  <Upload size={28} className="text-secondary-dark mb-2" />
                  <p className="text-sm font-medium text-[#0F172A]">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-secondary-dark mt-1 text-xs">
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
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedFile || !sheetName.trim()}
              className="bg-system-primary text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
