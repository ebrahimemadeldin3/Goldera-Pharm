"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Calendar as CalendarIcon, Upload } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { formatSaudiDateDisplay, getSaudiYear } from "@/lib/utils";
import { addMemberSchema, type AddMemberFormValues } from "../lib/schemas";
import { addTeamMemberAction } from "../api";
import { toast } from "@/lib/utils/toast";
import { User } from "../lib/types";
import { Region } from "@/lib/types/regions";

type AddMemberDialogProps = {
  supervisors?: User[];
  regions?: Region[];
};

export default function AddMemberDialog({
  supervisors = [],
  regions = [],
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDraggingCV, setIsDraggingCV] = useState(false);
  const [isDraggingCerts, setIsDraggingCerts] = useState(false);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      dateOfBirth: undefined,
      role: "MEDICAL_REP",
      regionId: "",
      subRegionId: "",
      dateOfRecruitment: undefined,
      educationBackground: "",
      iqamaNumber: "",
      passportNumber: "",
      resume: undefined,
      certificates: undefined,
      supervisorId: "",
    },
  });

  // Watch the role field to show/hide supervisor select
  const selectedRole = form.watch("role");
  // Watch the regionId field to show sub-regions
  const selectedRegionId = form.watch("regionId");

  // Get sub-regions for selected region
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const subRegions = selectedRegion?.subRegions || [];

  const onSubmit = (values: AddMemberFormValues) => {
    startTransition(async () => {
      try {
        const result = await addTeamMemberAction(values);

        if (result.success) {
          form.reset();
          setOpen(false);
          toast.success({
            title: "Team member added successfully",
            description: values.name,
          });
        } else {
          toast.error({
            title: "Failed to add team member",
            description: result.error?.message || "Please try again",
          });
        }
      } catch {
        toast.error({
          title: "An unexpected error occurred",
          description: "Please try again later",
        });
      }
    });
  };

  const inputBase =
    "bg-secondary-very-light border-[0.8px] border-[#E2E8F0] placeholder:text-secondary-text placeholder:text-[14px] placeholder:font-normal text-[14px] font-normal";

  const selectTriggerBase =
    "bg-secondary-very-light cursor-pointer border-[0.8px] border-[#E2E8F0] rounded-md text-[14px] font-normal";

  const popoverButtonBase =
    "h-10 w-full justify-start cursor-pointer text-left font-normal bg-secondary-very-light border-[0.8px] border-[#E2E8F0] text-[14px]";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-dialog-trigger="add-member"
          className="button-system-gradient-primary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Member
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[10px] border-[#E2E8F0] px-6 py-4 shadow-md sm:max-w-[977px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">
            Add New Team Member
          </DialogTitle>
          <DialogDescription className="text-[14px] font-normal">
            Enter the details of the new team member
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <p className="text-secondary-dark text-xs">
              Date fields use Saudi Arabia timezone (Asia/Riyadh).
            </p>
            {/* Basic Information */}
            <div className="flex flex-col gap-4">
              <h4 className="border-secondary-light border-b-[0.8px] pb-1 text-[16px] font-normal">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[14px] font-medium text-black">
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full name"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red absolute -bottom-5 text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[14px] font-medium text-black">
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@golderapharm.com"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red absolute -bottom-5 text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[14px] font-medium text-black">
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+966 XX XXX XXXX"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red absolute -bottom-5 text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[14px] font-medium text-black">
                        Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red absolute -bottom-5 text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[14px] font-medium text-black">
                        Date of Birth <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`${popoverButtonBase} ${!field.value && "text-secondary-text"}`}
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              {field.value ? (
                                <span className="text-[14px] font-normal">
                                  {formatSaudiDateDisplay(field.value)}
                                </span>
                              ) : (
                                <span className="text-secondary-text text-[14px] font-normal">
                                  Pick a date
                                </span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                            fromYear={1950}
                            toYear={getSaudiYear(new Date())}
                            defaultMonth={field.value || new Date(1990, 0)}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-dashboard-red absolute -bottom-5 text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Employment Details */}
            <div className="flex flex-col gap-4">
              <h4 className="border-secondary-light border-b-[0.8px] pb-1 text-[16px] font-normal">
                Employment Details
              </h4>
              <div className="grid grid-cols-1 gap-4 *:*:w-full md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateOfRecruitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Date of Recruitment
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`${popoverButtonBase} ${!field.value && "text-secondary-text"}`}
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              {field.value ? (
                                <span className="text-[14px] font-normal">
                                  {formatSaudiDateDisplay(field.value)}
                                </span>
                              ) : (
                                <span className="text-secondary-text text-[14px] font-normal">
                                  Pick a date
                                </span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="educationBackground"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Educational Background
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Bachelor of Pharmaceutical Sciences"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="regionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Region
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset subRegionId when region changes
                          form.setValue("subRegionId", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={selectTriggerBase}>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Role <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={selectTriggerBase}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MEDICAL_REP">
                            Medical Representative
                          </SelectItem>
                          <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subRegionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Sub-Region
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedRegionId || subRegions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className={selectTriggerBase}>
                            <SelectValue placeholder="Select sub-region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subRegions.map((subRegion) => (
                            <SelectItem key={subRegion.id} value={subRegion.id}>
                              {subRegion.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {selectedRole === "MEDICAL_REP" && (
                  <FormField
                    control={form.control}
                    name="supervisorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-medium text-black">
                          Supervisor <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerBase}>
                              <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supervisors.length > 0 ? (
                              supervisors.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-supervisors" disabled>
                                No supervisors available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="flex flex-col gap-4">
              <h4 className="border-secondary-light border-b-[0.8px] pb-1 text-[16px] font-normal">
                Documents & Identification
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="iqamaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Iqama Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Iqama number"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Passport Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter passport number"
                          {...field}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Attach CV/Resume
                      </FormLabel>
                      <FormControl>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingCV(true);
                          }}
                          onDragLeave={() => setIsDraggingCV(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingCV(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                            isDraggingCV
                              ? "border-dashboard-blue bg-blue-50"
                              : value
                                ? "border-gold bg-gold/10"
                                : "border-secondary-light bg-secondary-very-light"
                          }`}
                        >
                          <input
                            {...fieldProps}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              onChange(file);
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          <Upload className="text-secondary-text mb-2 h-8 w-8" />
                          {value ? (
                            <div className="text-center">
                              <p className="text-sm font-medium text-black">
                                {value.name}
                              </p>
                              <p className="text-secondary-text text-xs">
                                {(value.size / 1024).toFixed(1)} KB
                              </p>
                              <p className="text-secondary-text mt-1 text-xs">
                                Click or drop to replace
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-secondary-text text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-secondary-text text-xs">
                                PDF, DOC, DOCX (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificates"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-black">
                        Certificates
                      </FormLabel>
                      <FormControl>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingCerts(true);
                          }}
                          onDragLeave={() => setIsDraggingCerts(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingCerts(false);
                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              onChange(files);
                            }
                          }}
                          className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                            isDraggingCerts
                              ? "border-dashboard-green bg-green-50"
                              : value && value.length > 0
                                ? "border-gold bg-gold/10"
                                : "border-secondary-light bg-secondary-very-light"
                          }`}
                        >
                          <input
                            {...fieldProps}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              onChange(files);
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          <Upload className="text-secondary-text mb-2 h-8 w-8" />
                          {value && value.length > 0 ? (
                            <div className="text-center">
                              <p className="text-sm font-medium text-black">
                                {value.length} file{value.length > 1 ? "s" : ""}{" "}
                                selected
                              </p>
                              <div className="mt-1 max-h-16 overflow-y-auto">
                                {Array.from(value).map((file, idx) => (
                                  <p
                                    key={idx}
                                    className="text-secondary-text text-xs"
                                  >
                                    {file.name} ({(file.size / 1024).toFixed(1)}{" "}
                                    KB)
                                  </p>
                                ))}
                              </div>
                              <p className="text-secondary-text mt-1 text-xs">
                                Click or drop to replace
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-secondary-text text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-secondary-text text-xs">
                                PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
                              </p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gold hover:text-gold border-gold cursor-pointer border text-white hover:bg-white"
              >
                {isPending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
