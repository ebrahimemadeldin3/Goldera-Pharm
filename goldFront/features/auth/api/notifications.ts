"use server";
import { apiFetch } from "@/services/http";
import type { NotificationItem } from "../lib/types";

export async function getNotificationsAction() {
  try {
    const response = await apiFetch<{
      userId: string;
      data: NotificationItem[];
    }>("/api/notifications");
    return { success: true as const, ...response };
  } catch {
    return { success: false as const };
  }
}
