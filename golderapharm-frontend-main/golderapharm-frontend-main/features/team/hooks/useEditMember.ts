"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, RegionData } from "../lib/types";
import { updateTeamMemberAction } from "../api";
import { toast } from "@/lib/utils/toast";

type EditableFields = {
  name: string;
  email: string;
  phone: string;
  region: RegionData;
  isActive: boolean;
  role: "SUPERVISOR" | "MEDICAL_REP";
  employeeId?: string;
  password?: string;
};

export function useEditMember(
  initialData: User,
  currentUserRole: "MANAGER" | "SUPERVISOR",
) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editedData, setEditedData] = useState<EditableFields>({
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone,
    region: initialData.region,
    isActive: initialData.isActive,
    role: initialData.role as "SUPERVISOR" | "MEDICAL_REP",
    employeeId: initialData.employeeId,
    password: "",
  });

  const updateField = <K extends keyof EditableFields>(
    field: K,
    value: EditableFields[K],
  ) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    if (!isEditMode) {
      // Reset to initial data when entering edit mode
      setEditedData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        region: initialData.region,
        isActive: initialData.isActive,
        role: initialData.role as "SUPERVISOR" | "MEDICAL_REP",
        employeeId: initialData.employeeId,
        password: "",
      });
    }
  };

  const saveChanges = () => {
    startTransition(async () => {
      try {
        const dataToUpdate: Record<string, string | boolean | undefined> = {
          name: editedData.name,
          email: editedData.email,
          phone: editedData.phone,
          regionId: editedData.region.id,
          subRegionId: editedData.region.subRegion.id,
          isActive: editedData.isActive,
          role: editedData.role,
        };

        if (editedData.employeeId) {
          dataToUpdate.employeeId = editedData.employeeId;
        }

        if (editedData.password && editedData.password.length > 0) {
          dataToUpdate.password = editedData.password;
        }

        const result = await updateTeamMemberAction(
          initialData.id,
          dataToUpdate,
          currentUserRole,
        );

        if (result.success) {
          toast.success({
            title: "Profile updated successfully",
            description: "Team member information has been updated",
          });
          setIsEditMode(false);
          router.refresh();
        } else {
          toast.error({
            title: "Failed to update profile",
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

  const cancelEdit = () => {
    setEditedData({
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone,
      region: initialData.region,
      isActive: initialData.isActive,
      role: initialData.role as "SUPERVISOR" | "MEDICAL_REP",
      employeeId: initialData.employeeId,
      password: "",
    });
    setIsEditMode(false);
  };

  return {
    isEditMode,
    editedData,
    isPending,
    updateField,
    toggleEditMode,
    saveChanges,
    cancelEdit,
  };
}
