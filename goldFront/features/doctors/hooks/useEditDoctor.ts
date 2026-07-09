"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DoctorProfileData } from "../lib/types";
import { updateDoctorAction } from "../api";
import { toast } from "@/lib/utils/toast";

type EditableFields = {
  nameEN: string;
  nameAR: string;
  email: string | null;
  phone: string;
  specialty: string;
  grade: string;
  avgPatientsPerDay: number | null;
  LicenseNumber: string | null;
  accountName: string;
  subRegion: string;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function useEditDoctor(initialData: DoctorProfileData) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editedData, setEditedData] = useState<EditableFields>({
    nameEN: initialData.nameEN,
    nameAR: initialData.nameAR,
    email: initialData.email,
    phone: initialData.phone,
    specialty: initialData.specialty,
    grade: initialData.grade,
    avgPatientsPerDay: initialData.avgPatientsPerDay,
    LicenseNumber: initialData.LicenseNumber,
    accountName: initialData.accountName,
    subRegion: initialData.subRegion,
    area: initialData.area,
    latitude: initialData.latitude,
    longitude: initialData.longitude,
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
        nameEN: initialData.nameEN,
        nameAR: initialData.nameAR,
        email: initialData.email,
        phone: initialData.phone,
        specialty: initialData.specialty,
        grade: initialData.grade,
        avgPatientsPerDay: initialData.avgPatientsPerDay,
        LicenseNumber: initialData.LicenseNumber,
        accountName: initialData.accountName,
        subRegion: initialData.subRegion,
        area: initialData.area,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      });
    }
  };

  const saveChanges = () => {
    startTransition(async () => {
      try {
        const dataToUpdate = {
          nameEN: editedData.nameEN,
          nameAR: editedData.nameAR,
          email: editedData.email || undefined,
          phone: editedData.phone,
          specialty: editedData.specialty,
          grade: editedData.grade,
          LicenseNumber: editedData.LicenseNumber || undefined,
          avgPatientsPerDay: editedData.avgPatientsPerDay || undefined,
          accountName: editedData.accountName,
          subRegion: editedData.subRegion,
          area: editedData.area || undefined,
          latitude: editedData.latitude || undefined,
          longitude: editedData.longitude || undefined,
        };

        const result = await updateDoctorAction(initialData.id, dataToUpdate);

        if (result.success) {
          toast.success({
            title: "Profile updated successfully",
            description: "Doctor information has been updated",
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
    setIsEditMode(false);
    // Reset to initial data
    setEditedData({
      nameEN: initialData.nameEN,
      nameAR: initialData.nameAR,
      email: initialData.email,
      phone: initialData.phone,
      specialty: initialData.specialty,
      grade: initialData.grade,
      avgPatientsPerDay: initialData.avgPatientsPerDay,
      LicenseNumber: initialData.LicenseNumber,
      accountName: initialData.accountName,
      subRegion: initialData.subRegion,
      area: initialData.area,
      latitude: initialData.latitude,
      longitude: initialData.longitude,
    });
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
