"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDrawer } from "@/components/shared/FormDrawer";
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
  ImageIcon,
  Loader2,
  Package,
  Plus,
  ScanLine,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "../lib/schemas";
import { createProductAction, updateProductAction } from "../api";
import type { ProductApiResponse } from "../lib/types";
import { getProductStoredImageUrl } from "../lib/utils";
import { toast } from "@/lib/utils/toast";

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type AddProductDialogProps = {
  product?: ProductApiResponse | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProductUpdated?: (product: ProductApiResponse) => void;
  trigger?: ReactNode;
};

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

async function detectImageMime(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  const header = String.fromCharCode(...bytes);
  if (header.startsWith("RIFF") && header.slice(8, 12) === "WEBP") {
    return "image/webp";
  }

  return null;
}

export function AddProductDialog({
  product,
  open: controlledOpen,
  onOpenChange,
  onProductUpdated,
  trigger,
}: AddProductDialogProps = {}) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const [imageError, setImageError] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(product);
  const open = controlledOpen ?? uncontrolledOpen;
  const storedImageUrl = product ? getProductStoredImageUrl(product) : null;
  const previewSrc =
    selectedPreviewUrl || (!removeExistingImage ? storedImageUrl : null);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: getProductFormDefaults(product),
  });

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  useEffect(() => {
    form.reset(getProductFormDefaults(product));
  }, [form, product]);

  function clearSelectedImage() {
    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedImage(null);
    setSelectedPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetDialog() {
    form.reset(getProductFormDefaults(product));
    clearSelectedImage();
    setImageError("");
    setRemoveExistingImage(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetDialog();
    }
  }

  function closeAfterSubmit() {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;

    setImageError("");

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      setImageError("Image must be smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const detectedMime = await detectImageMime(file);
    const declaredMimeAllowed =
      !file.type ||
      ALLOWED_PRODUCT_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number],
      );

    if (
      !detectedMime ||
      !declaredMimeAllowed ||
      !ALLOWED_PRODUCT_IMAGE_TYPES.includes(
        detectedMime as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number],
      )
    ) {
      setImageError("Please select a JPG, PNG or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    clearSelectedImage();
    setSelectedImage(file);
    setSelectedPreviewUrl(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  }

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleImageFile(event.target.files?.[0]);
  }

  function handleRemoveImage() {
    clearSelectedImage();
    setImageError("");
    if (isEditMode && storedImageUrl) {
      setRemoveExistingImage(true);
    }
  }

  async function onSubmit(values: CreateProductFormValues) {
    if (isSubmitting) return;
    if (imageError) {
      toast.error({
        title: "Check product image",
        description: imageError,
      });
      return;
    }

    const productPayload = new FormData();
    productPayload.append("name", values.name.trim());
    productPayload.append("internalRef", values.internalRef.trim());
    productPayload.append("salesPrice", String(values.salesPrice));
    if (selectedImage) productPayload.append("image", selectedImage);
    if (isEditMode && removeExistingImage && !selectedImage) {
      productPayload.append("removeImage", "true");
    }

    setIsSubmitting(true);

    try {
      const result = product
        ? await updateProductAction(product.id, productPayload)
        : await createProductAction(productPayload);
      if (result.success) {
        toast.success({
          title: product
            ? "Product updated successfully"
            : "Product added successfully",
        });
        if (product && result.data) onProductUpdated?.(result.data);
        closeAfterSubmit();
        form.reset();
        setSelectedImage(null);
        setSelectedPreviewUrl(null);
        setRemoveExistingImage(false);
        router.refresh();
      } else {
        toast.error({
          title: product ? "Couldn't update product" : "Couldn't add product",
          description: result.error?.message || "Please try again.",
        });
      }
    } catch {
      toast.error({
        title: product ? "Couldn't update product" : "Couldn't add product",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        trigger
          ? trigger
          : !isEditMode && (
              <Button className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-transparent bg-[#101D36] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-all duration-[180ms] ease-out hover:-translate-y-0.5 hover:bg-[#101D36]/95 hover:text-white hover:shadow-[0_10px_25px_rgba(16,29,54,0.22)] focus-visible:ring-4 focus-visible:ring-[#C9A44C]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                <Plus className="products-add-icon h-4 w-4 text-[#C9A44C] transition-transform duration-[180ms] ease-out group-hover:scale-105 group-hover:rotate-90" />
                Add Product
              </Button>
            )
      }
      title={isEditMode ? "Edit Product" : "Add Product"}
      eyebrow={isEditMode ? "Catalog Update" : "New Product"}
      description={
        isEditMode
          ? "Update the product name, image, internal reference and sales price."
          : "Add a product name, image, internal reference and sales price."
      }
      icon={<Package className="size-5" aria-hidden="true" />}
      width="md"
      bodyClassName="flex overflow-hidden p-0"
      closeLabel={
        isEditMode ? "Close Edit Product drawer" : "Close Add Product drawer"
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="bg-gp-surface-page min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-[#182033]">
                  Product Image
                </label>
                <span className="text-gp-text-muted text-xs font-medium">
                  Optional
                </span>
              </div>

              <div className="rounded-[12px] border border-[#E5E8EF] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="relative flex aspect-[16/9] min-h-[168px] items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[#D7DCE5] bg-[#F8FAFC]">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt="Product preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center px-4 text-center">
                      <span className="flex size-11 items-center justify-center rounded-full bg-[#FFF8E5] text-[#B18732]">
                        <ImageIcon className="size-5" aria-hidden="true" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-[#182033]">
                        Upload product image
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#667085]">
                        PNG, JPG or WebP. Maximum 5 MB.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 rounded-[10px] border-[#E5E8EF] px-4 font-semibold text-[#344054]"
                  >
                    <Upload className="size-4" />
                    {previewSrc ? "Change Image" : "Upload Image"}
                  </Button>
                  {previewSrc && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleRemoveImage}
                      className="h-10 rounded-[10px] border-[#F3C5C5] px-4 font-semibold text-[#B42318] hover:bg-[#FEF3F2] hover:text-[#B42318]"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>

                {imageError && (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[#B42318]">
                      {imageError}
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setImageError("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="w-fit text-xs font-bold text-[#9A7628] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                )}
                {removeExistingImage && !selectedImage && (
                  <p className="mt-2 text-sm font-medium text-[#667085]">
                    Image will be removed when you save changes.
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={isSubmitting}
                onChange={handleImageInputChange}
              />
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
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#344054]"
                      aria-hidden="true"
                    />
                    <FormControl>
                      <Input
                        placeholder="e.g. Omega-3 Capsules"
                        disabled={isSubmitting}
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
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#344054]"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          placeholder="e.g. P01001"
                          disabled={isSubmitting}
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
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#344054]"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          value={field.value || ""}
                          disabled={isSubmitting}
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
          </div>

          <div className="gp-form-section sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-[#EEF1F5] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-gp-text-muted hidden text-xs font-medium sm:block">
              Complete required fields before submitting
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="h-11 rounded-[10px] border-[#E5E8EF] px-5 font-semibold text-[#475467]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gp-primary-action h-11 rounded-[10px] bg-[#101D36] px-5 font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-all duration-[180ms] hover:-translate-y-px hover:bg-[#101D36]/95 hover:text-white hover:shadow-[0_10px_24px_rgba(16,29,54,0.22)] disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin text-[#C9A44C]" />
                ) : isEditMode ? (
                  <Package className="size-4 text-[#C9A44C]" />
                ) : (
                  <Plus className="size-4 text-[#C9A44C]" />
                )}
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Adding..."
                  : isEditMode
                    ? "Save Changes"
                    : "Add Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </FormDrawer>
  );
}
