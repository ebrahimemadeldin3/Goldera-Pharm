"use server";

import { apiFetch } from "@/services/http";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoleRedirectPath } from "@/features/auth/lib/types/roles";
import { AuthUser, LoginCredentials } from "../lib/types";
import { ApiError } from "@/services/api-error";

export async function login(
  credentials: LoginCredentials,
): Promise<{ token: string; data: AuthUser }> {
  return apiFetch<{ token: string; data: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Server action to handle login and set cookie
 */
export async function loginAction(credentials: LoginCredentials) {
  try {
    const response = await login(credentials);

    const cookieStore = await cookies();
    cookieStore.set("token", response.token, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      success: true,
      user: response.data,
      redirectPath: getRoleRedirectPath(response.data.role),
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    };
  }
}

/**
 * Server action to logout
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/");
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<{ data: AuthUser } | null> {
  try {
    return await apiFetch<{ data: AuthUser }>("/api/profiles");
  } catch {
    return null;
  }
}
