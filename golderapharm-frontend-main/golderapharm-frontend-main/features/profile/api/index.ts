"use server";

import { apiFetch } from "@/services/http";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/services/api-error";
import { ProfileApiResponse, UserProfile } from "../lib/types";
import { cookies } from "next/headers";
import { updateLastApiRequestTime } from "@/lib/utils/get-last-refresh-time";

/**
 * Fetches the current user's profile from the API
 */
export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiFetch<ProfileApiResponse>("/api/profiles", {
    method: "GET",
  });
  return response.data;
}

/**
 * Update user profile data
 */
export async function updateProfile(data: {
  name: string;
  email: string;
  phone: string;
  location: string | null;
  bio: string | null;
}): Promise<UserProfile> {
  const response = await apiFetch<ProfileApiResponse>("/api/profiles", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.data;
}

/**
 * Server action to update profile with revalidation
 */
export async function updateProfileAction(data: {
  name: string;
  email: string;
  phone: string;
  location: string | null;
  bio: string | null;
}) {
  try {
    const profile = await updateProfile(data);

    // Revalidate the profile page to show updated data
    revalidatePath("/manager/profile");
    revalidatePath("/supervisor/profile");
    revalidatePath("/rep/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Profile update error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPDATE_ERROR",
        message: err.message || "Failed to update profile",
      },
    };
  }
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(file: File): Promise<UserProfile> {
  // Update last API request time
  updateLastApiRequestTime();

  const formData = new FormData();
  formData.append("profileImage", file);

  const token = (await cookies()).get("token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profiles/profile-image`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        // Don't set Content-Type - let browser set it with boundary for FormData
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    },
  );

  if (!res.ok) {
    let error: ApiError;
    try {
      error = await res.json();
    } catch {
      error = {
        statusCode: res.status,
        code: "UPLOAD_ERROR",
        message: "Failed to upload image",
      };
    }
    throw error;
  }

  const response: ProfileApiResponse = await res.json();
  return response.data;
}

/**
 * Server action to upload profile image
 */
export async function uploadProfileImageAction(formData: FormData) {
  try {
    const file = formData.get("profileImage") as File;

    if (!file) {
      return {
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file provided",
        },
      };
    }

    const profile = await uploadProfileImage(file);

    // Revalidate the profile page to show updated image
    revalidatePath("/manager/profile");
    revalidatePath("/supervisor/profile");
    revalidatePath("/rep/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Profile image upload error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPLOAD_ERROR",
        message: err.message || "Failed to upload profile image",
      },
    };
  }
}

/**
 * Remove profile image
 */
export async function removeProfileImage(): Promise<UserProfile> {
  const response = await apiFetch<ProfileApiResponse>(
    "/api/profiles/profile-image",
    {
      method: "DELETE",
    },
  );
  return response.data;
}

/**
 * Server action to remove profile image
 */
export async function removeProfileImageAction() {
  try {
    const profile = await removeProfileImage();

    // Revalidate the profile page to show updated data
    revalidatePath("/manager/profile");
    revalidatePath("/supervisor/profile");
    revalidatePath("/rep/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Profile image removal error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "REMOVE_ERROR",
        message: err.message || "Failed to remove profile image",
      },
    };
  }
}
