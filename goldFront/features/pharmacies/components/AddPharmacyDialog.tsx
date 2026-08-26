"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
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
import { Plus, Loader2, Store } from "lucide-react";
import {
  createPharmacySchema,
  type CreatePharmacyFormValues,
} from "../lib/schemas";
import { createPharmacyAction } from "../api";
import { toast } from "sonner";

export function AddPharmacyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePharmacyFormValues>({
    resolver: zodResolver(createPharmacySchema),
    defaultValues: {
      name: "",
      city: "",
      subRegion: "",
      region: "",
      country: "Saudi Arabia",
    },
  });

  function onSubmit(values: CreatePharmacyFormValues) {
    startTransition(async () => {
      const result = await createPharmacyAction(values);
      if (result.success) {
        toast.success("Pharmacy added successfully");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to add pharmacy");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-5 rounded-[10px] bg-[#C9A44C] hover:bg-[#B18732] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(201,164,76,0.25)] transition-all duration-170 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(201,164,76,0.3)] cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 disabled:opacity-50 disabled:pointer-events-none ml-auto">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add Pharmacy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store size={18} />
            Add New Pharmacy
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pharmacy Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. C0001-صيدلية الشفاء" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Riyadh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Region <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Taif" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Western Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Saudi Arabia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-10 border-[#E5E8EF] bg-white text-[#182033] hover:bg-[#F9FAFB] px-5 text-xs font-semibold rounded-[10px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#C9A44C] hover:bg-[#B18732] text-white h-10 px-5 text-xs font-semibold rounded-[10px] shadow-[0_4px_14px_rgba(201,164,76,0.25)] transition-all duration-170 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Pharmacy
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
