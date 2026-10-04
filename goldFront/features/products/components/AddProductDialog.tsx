"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
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
  Loader2,
  Package,
  Plus,
  ScanLine,
} from "lucide-react";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "../lib/schemas";
import { createProductAction, updateProductAction } from "../api";
import type { ProductApiResponse } from "../lib/types";
import { toast } from "@/lib/utils/toast";

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

export function AddProductDialog({
  product,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: AddProductDialogProps = {}) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditMode = Boolean(product);
  const open = controlledOpen ?? uncontrolledOpen;

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: getProductFormDefaults(product),
  });

  useEffect(() => {
    form.reset(getProductFormDefaults(product));
  }, [form, product]);

  function resetDialog() {
    form.reset(getProductFormDefaults(product));
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

  function onSubmit(values: CreateProductFormValues) {
    const productPayload = {
      name: values.name.trim(),
      internalRef: values.internalRef.trim(),
      salesPrice: values.salesPrice,
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, productPayload)
        : await createProductAction(productPayload);
      if (result.success) {
        toast.success({
          title: product
            ? "Product updated successfully"
            : "Product added successfully",
        });
        closeAfterSubmit();
        form.reset();
        router.refresh();
      } else {
        toast.error({
          title: product ? "Couldn't update product" : "Couldn't add product",
          description: result.error?.message || "Please try again.",
        });
      }
    });
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
          ? "Update the product name, internal reference and sales price."
          : "Add a product name, internal reference and sales price."
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
                disabled={isPending}
                className="h-11 rounded-[10px] border-[#E5E8EF] px-5 font-semibold text-[#475467]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gp-primary-action h-11 rounded-[10px] bg-[#101D36] px-5 font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-all duration-[180ms] hover:-translate-y-px hover:bg-[#101D36]/95 hover:text-white hover:shadow-[0_10px_24px_rgba(16,29,54,0.22)] disabled:translate-y-0"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin text-[#C9A44C]" />
                ) : isEditMode ? (
                  <Package className="size-4 text-[#C9A44C]" />
                ) : (
                  <Plus className="size-4 text-[#C9A44C]" />
                )}
                {isEditMode ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </FormDrawer>
  );
}
