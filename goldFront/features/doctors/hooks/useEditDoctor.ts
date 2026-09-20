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

function optionalText(value: string | null) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : undefined;
}

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
          nameEN: editedData.nameEN.trim(),
          nameAR: editedData.nameAR.trim(),
          email: optionalText(editedData.email),
          phone: editedData.phone.trim(),
          specialty: editedData.specialty.trim(),
          grade: editedData.grade.trim(),
          LicenseNumber: optionalText(editedData.LicenseNumber),
          avgPatientsPerDay: editedData.avgPatientsPerDay ?? undefined,
          accountName: editedData.accountName.trim(),
          subRegion: editedData.subRegion.trim(),
          area: optionalText(editedData.area),
          latitude: editedData.latitude ?? undefined,
          longitude: editedData.longitude ?? undefined,
        };

        const result = await updateDoctorAction(initialData.id, dataToUpdate);

        if (result.success) {
          toast.success({
            title: "Doctor updated successfully",
            description: "Doctor information was updated successfully.",
          });
          setIsEditMode(false);
          router.refresh();
        } else {
          toast.error({
            title: "Couldn't update doctor",
            description: result.error?.message || "Please try again",
          });
        }
      } catch {
        toast.error({
          title: "Couldn't update doctor",
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
