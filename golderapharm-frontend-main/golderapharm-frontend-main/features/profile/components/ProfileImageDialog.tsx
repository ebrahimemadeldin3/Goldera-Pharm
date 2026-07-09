"use client";

import { useState, useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadProfileImageAction, removeProfileImageAction } from "../api";
import { useRouter } from "next/navigation";

interface ProfileImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasImage: boolean;
}

export default function ProfileImageDialog({
  open,
  onOpenChange,
  hasImage,
}: ProfileImageDialogProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const result = await uploadProfileImageAction(formData);

      if (result.success) {
        toast.success("Profile image uploaded successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to upload image");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);

    try {
      const result = await removeProfileImageAction();

      if (result.success) {
        toast.success("Profile image removed successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to remove image");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Image</DialogTitle>
            <DialogDescription>
              Upload a new profile image or remove the existing one
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={handleUploadClick}
              disabled={isUploading || isRemoving}
              className="bg-system-primary hover:bg-system-primary/90 w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            {hasImage && (
              <Button
                onClick={handleRemove}
                disabled={isUploading || isRemoving}
                variant="outline"
                className="border-dashboard-red text-dashboard-red hover:bg-dashboard-red/10 w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRemoving ? "Removing..." : "Remove Image"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
