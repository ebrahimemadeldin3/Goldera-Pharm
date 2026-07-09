"use server";
import { updateLastApiRequestTime } from "@/lib/utils/get-last-refresh-time";
import { ApiError } from "./api-error";
import { cookies } from "next/headers";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Update last API request time
  updateLastApiRequestTime();

  const token = (await cookies()).get("token")?.value;
  const method = (options.method || "GET").toUpperCase();

  // Always bypass Next.js fetch caching unless a caller explicitly overrides it.
  // This keeps all GET data fresh after create/update/delete actions.
  const cacheOption = options.cache ?? "no-store";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      credentials: "include",
      method,
      cache: cacheOption,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    },
  );
  if (!res.ok) {
    let error: ApiError;

    try {
      error = await res.json();
    } catch {
      error = {
        statusCode: res.status,
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      };
    }
    throw error;
  }
  return res.json();
}
