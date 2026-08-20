"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDoctorAction } from "../api";
import { addDoctorSchema, type AddDoctorFormValues } from "../lib/schemas";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { getRegionsAction } from "@/lib/requests/regions";
import { SubRegion } from "@/lib/types/regions";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";

export default function AddDoctorForm() {
  const router = useRouter();
  const { role } = useRoleUI();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [subRegions, setSubRegions] = useState<SubRegion[]>([]);

  // Fetch all subregions from all regions on mount
  useEffect(() => {
    const fetchSubRegions = async () => {
      const result = await getRegionsAction();
      if (result.success && result.regions) {
        // Flatten all subregions from all regions
        const allSubRegions = result.regions.flatMap(
          (region) => region.subRegions,
        );
        setSubRegions(allSubRegions);
      }
    };
    fetchSubRegions();
  }, []);

  const getBackHref = () => {
    if (role === "MANAGER") return "/manager/doctors";
    if (role === "SUPERVISOR") return "/supervisor/doctors";
    return "/rep/doctors";
  };

  const form = useForm<AddDoctorFormValues>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      nameEN: "",
      nameAR: "",
      specialty: "",
      subRegion: "",
      license: "",
      email: "",
      phone: "",
      grade: "",
      avgPatients: "",
      accountName: "",
    },
  });

  const onSubmit = (values: AddDoctorFormValues) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await createDoctorAction({
          nameEN: values.nameEN,
          nameAR: values.nameAR,
          email: values.email || undefined,
          phone: values.phone,
          grade: values.grade,
          specialty: values.specialty,
          LicenseNumber: values.license || undefined,
          avgPatientsPerDay: values.avgPatients
            ? parseInt(values.avgPatients)
            : undefined,
          accountName: values.accountName,
          subRegion: values.subRegion, // Send subRegion name
        });
        if (result.success) {
          router.push(getBackHref());
          router.refresh();
        } else if (result.error) {
          setError(result.error.message);
        }
      } catch (err) {
        setError((err as Error)?.message || "An unexpected error occurred");
      }
    });
  };

  const inputBase =
    "bg-secondary-very-light border-[.8px] border-[#E2E8F0] px-4 placeholder:text-secondary-text placeholder:text-sm placeholder:font-normal";

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-start gap-2">
        <Link
          href={getBackHref()}
          className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="ml-3 min-w-0 flex-1">
          <h1 className="font-nomral text-2xl text-black md:text-[34px]">Add New Doctor</h1>
          <p className="text-secondary-dark text-[16px]">
            Add a new doctor to the database
          </p>
        </div>
      </header>

      {error && (
        <div className="text-dashboard-red rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          {error}
        </div>
      )}

      <section className="border-secondary-light rounded-[14px] border-[.8px] bg-white p-6">
        <h2 className="mb-6 text-[22px]/8 font-normal">Doctor Information</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="nameEN"
              render={() => (
                <FormItem>
                  <FormLabel>English Name *</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="Dr. Mohammed Al-Rashid"
                      {...form.register("nameEN", { required: true })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameAR"
              render={() => (
                <FormItem>
                  <FormLabel>Arabic Name *</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="د. محمد الراشد"
                      {...form.register("nameAR", { required: true })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={() => (
                <FormItem>
                  <FormLabel>Specialty *</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="e.g. Cardiology"
                      {...form.register("specialty", { required: true })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={() => (
                <FormItem>
                  <FormLabel>Grade *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => form.setValue("grade", v)}
                      defaultValue=""
                    >
                      <SelectTrigger
                        className={`${inputBase} w-full cursor-pointer`}
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subRegion"
              render={() => (
                <FormItem>
                  <FormLabel>Area *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => form.setValue("subRegion", v)}
                      defaultValue=""
                    >
                      <SelectTrigger
                        className={`${inputBase} w-full cursor-pointer`}
                      >
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {subRegions.map((subRegion) => (
                          <SelectItem key={subRegion.id} value={subRegion.name}>
                            {subRegion.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={() => (
                <FormItem>
                  <FormLabel>Account Name *</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="King Faisal Hospital"
                      {...form.register("accountName", { required: true })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="license"
              render={() => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="License number"
                      {...form.register("license")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="doctor@hospital.sa"
                      {...form.register("email")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={() => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      placeholder="+966 50 123 4567"
                      {...form.register("phone", { required: true })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avgPatients"
              render={() => (
                <FormItem>
                  <FormLabel>Avg. Patients Per Day</FormLabel>
                  <FormControl>
                    <Input
                      className={inputBase}
                      type="number"
                      placeholder="50"
                      {...form.register("avgPatients")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="col-span-1 mt-6 md:col-span-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gold hover:border-gold hover:text-gold mb-10 inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-transparent text-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-43.25"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {isPending ? "Adding..." : "Add Doctor"}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </PageContainer>
  );
}
