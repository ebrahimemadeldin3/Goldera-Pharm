"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  BadgeDollarSign,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  ScanLine,
  UploadCloud,
  X,
} from "lucide-react";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "../lib/schemas";
import { createProductAction } from "../api";
import type { ProductApiResponse } from "../lib/types";
import {
  getProductImageInfo,
  getStoredProductImageInfo,
  readStoredProductImages,
  saveStoredProductImage,
  saveStoredProductOverride,
} from "../lib/utils";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AddProductDialogProps = {
  product?: ProductApiResponse | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProductUpdated?: (product: ProductApiResponse) => void;
  trigger?: ReactNode;
};

function revokeImagePreview(src: string | null) {
  if (src?.startsWith("blob:")) {
    URL.revokeObjectURL(src);
  }
}

function getProductFormDefaults(
  product?: ProductApiResponse | null,
): CreateProductFormValues {
  return {
    name: product?.name || "",
    internalRef: product?.internalRef || "",
    salesPrice:
      typeof product?.salesPrice === "number" &&
      Number.isFinite(product.salesPrice)
        ? product.salesPrice
        : 0,
  };
}

function getInitialImagePreview(product?: ProductApiResponse | null) {
  if (!product) {
    return null;
  }

  const imageInfo =
    getStoredProductImageInfo(product, readStoredProductImages()) ||
    getProductImageInfo(product);

  return imageInfo?.src || null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function createTableImageDataUrl(file: File): Promise<string> {
  const rawDataUrl = await readFileAsDataUrl(file);

  return new Promise((resolve) => {
    const previewImage = new window.Image();

    previewImage.onload = () => {
      const maxSize = 900;
      const scale = Math.min(
        1,
        maxSize / Math.max(previewImage.width, previewImage.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(previewImage.width * scale));
      canvas.height = Math.max(1, Math.round(previewImage.height * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        resolve(rawDataUrl);
        return;
      }

      context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.86));
    };

    previewImage.onerror = () => resolve(rawDataUrl);
    previewImage.src = rawDataUrl;
  });
}

export function AddProductDialog({
  product,
  open: controlledOpen,
  onOpenChange,
  onProductUpdated,
  trigger,
}: AddProductDialogProps = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditMode = Boolean(product);
  const open = controlledOpen ?? uncontrolledOpen;

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: getProductFormDefaults(product),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    getInitialImagePreview(product),
  );

  useEffect(() => {
    return () => {
      revokeImagePreview(imagePreview);
    };
  }, [imagePreview]);

  function clearImage() {
    setImagePreview((current) => {
      revokeImagePreview(current);
      return null;
    });
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetDialog() {
    form.reset();
    clearImage();
    setIsDragging(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen && !isPending) {
      resetDialog();
    }
  }

  function closeAfterSubmit() {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }

  function handleImageFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WEBP product image");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Product image must be smaller than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview((current) => {
      revokeImagePreview(current);
      return URL.createObjectURL(file);
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  }

  function onSubmit(values: CreateProductFormValues) {
    const productPayload = {
      name: values.name.trim(),
      internalRef: values.internalRef.trim(),
      salesPrice: values.salesPrice,
    };
    const selectedImage = imageFile;

    startTransition(async () => {
      if (product) {
        const updatedProduct: ProductApiResponse = {
          ...product,
          ...productPayload,
          updatedAt: new Date().toISOString(),
        };
        const productSaved = saveStoredProductOverride(updatedProduct);

        if (!productSaved) {
          toast.error("Failed to save product changes in this browser");
          return;
        }

        if (selectedImage) {
          const imageDataUrl = await createTableImageDataUrl(selectedImage);
          const imageSaved = saveStoredProductImage(
            productPayload,
            imageDataUrl,
          );

          if (!imageSaved) {
            toast.warning(
              "Product updated, but the image could not be saved in this browser",
            );
          }
        }

        toast.success("Product updated successfully");
        onProductUpdated?.(updatedProduct);
        closeAfterSubmit();
        return;
      }

      const result = await createProductAction(productPayload);
      if (result.success) {
        if (selectedImage) {
          const imageDataUrl = await createTableImageDataUrl(selectedImage);
          const imageSaved = saveStoredProductImage(
            productPayload,
            imageDataUrl,
          );

          if (!imageSaved) {
            toast.warning(
              "Product added, but the image could not be saved in this browser",
            );
          }
        }

        toast.success("Product added successfully");
        closeAfterSubmit();
        form.reset();
        setImageFile(null);
        setImagePreview(null);
        setIsDragging(false);
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to add product");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isEditMode ? (
        <DialogTrigger asChild>
          <Button className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-transparent bg-[#C9A44C] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(201,164,76,0.18)] transition-all duration-[180ms] ease-out hover:-translate-y-0.5 hover:bg-[#D2B15E] hover:text-white hover:shadow-[0_10px_25px_rgba(201,164,76,0.20)] focus-visible:ring-4 focus-visible:ring-[#C9A44C]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
            <Plus className="products-add-icon h-4 w-4 transition-transform duration-[180ms] ease-out group-hover:scale-105 group-hover:rotate-90" />
            Add New Product
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-[18px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(12,22,42,0.22)] sm:max-w-[590px]">
        <div className="relative overflow-hidden bg-[#101D36] px-5 py-5 text-white sm:px-6">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_24px)] opacity-35" />
          <DialogHeader className="relative z-10 gap-3 text-left">
            <span className="flex size-11 items-center justify-center rounded-[12px] border border-[#D4AF4F]/35 bg-[#D4AF4F]/15 text-[#F4D37D]">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-[22px] leading-tight font-semibold">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-[440px] text-sm leading-6 text-[#C8D2E1]">
                {isEditMode
                  ? "Update catalog details and the product image used in the table."
                  : "Add catalog details and the product image used in the table."}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-h-[calc(92vh-132px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#182033]">
                  Product Image
                </p>
                {imageFile && (
                  <span className="max-w-[220px] truncate text-xs font-medium text-[#667085]">
                    {imageFile.name}
                  </span>
                )}
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative min-h-[148px] cursor-pointer overflow-hidden rounded-[14px] border border-dashed p-4 transition-[border-color,background-color,box-shadow] duration-[180ms] ${
                  isDragging
                    ? "border-[#D4AF4F] bg-[#FFF8E5] shadow-[0_0_0_4px_rgba(212,175,79,0.14)]"
                    : "border-[#D8DEE8] bg-[#F8FAFC] hover:border-[#D4AF4F]/70 hover:bg-[#FFFDF7]"
                }`}
              >
                {imagePreview ? (
                  <div className="flex min-h-[116px] items-center gap-4">
                    <div
                      className="size-[112px] shrink-0 rounded-[12px] border border-[#E5E8EF] bg-white bg-contain bg-center bg-no-repeat p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      style={{ backgroundImage: `url(${imagePreview})` }}
                      aria-label="Selected product image preview"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#182033]">
                        Product image ready
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#667085]">
                        This image will appear beside the product name in the
                        catalog table.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3 h-8 rounded-[8px] border-[#E5E8EF] px-3 text-xs font-semibold text-[#667085]"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[116px] flex-col items-center justify-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-[#EDF4FF] text-[#3972D5]">
                      <ImagePlus className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-[#182033]">
                      Drop product image here
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#667085]">
                      JPG, PNG, or WEBP up to 5MB
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-xs font-semibold text-[#B18732] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                      <UploadCloud className="size-3.5" aria-hidden="true" />
                      Browse image
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#182033]">
                    Product Name
                  </FormLabel>
                  <div className="relative">
                    <Package
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8A94A6]"
                      aria-hidden="true"
                    />
                    <FormControl>
                      <Input
                        placeholder="e.g. Omega-3 Capsules"
                        className="h-11 rounded-[10px] border-[#E5E8EF] bg-white pl-10 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] focus-visible:border-[#D4AF4F] focus-visible:ring-[#D4AF4F]/20"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="internalRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#182033]">
                      Internal Reference
                    </FormLabel>
                    <div className="relative">
                      <ScanLine
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8A94A6]"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          placeholder="e.g. P01001"
                          className="h-11 rounded-[10px] border-[#E5E8EF] bg-white pl-10 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] focus-visible:border-[#D4AF4F] focus-visible:ring-[#D4AF4F]/20"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#182033]">
                      Sales Price (SAR)
                    </FormLabel>
                    <div className="relative">
                      <BadgeDollarSign
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8A94A6]"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          value={field.value || ""}
                          onChange={(event) =>
                            field.onChange(parseFloat(event.target.value) || 0)
                          }
                          className="h-11 rounded-[10px] border-[#E5E8EF] bg-white pl-10 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] focus-visible:border-[#D4AF4F] focus-visible:ring-[#D4AF4F]/20"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF1F5] pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="h-11 rounded-[10px] border-[#E5E8EF] px-5 font-semibold text-[#475467]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 rounded-[10px] bg-[#C9A44C] px-5 font-semibold text-white shadow-[0_8px_18px_rgba(201,164,76,0.18)] transition-all duration-[180ms] hover:bg-[#D2B15E] hover:text-white"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
