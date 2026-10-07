import { NextRequest, NextResponse } from "next/server";
import { getRoleRedirectPath } from "./features/auth/lib/types/roles";
import { UserRole } from "@/lib/types";

const knownRoles = new Set<UserRole>(["MANAGER", "SUPERVISOR", "MEDICAL_REP"]);

function decodeJwtPayload(token: string): { role?: unknown; exp?: unknown } {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Missing token payload");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return JSON.parse(atob(padded));
}

function redirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.delete("token");
  return response;
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (url.pathname !== "/") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  let payload: { role?: unknown; exp?: unknown };
  try {
    payload = decodeJwtPayload(token);
  } catch {
    return redirectToLogin(req);
  }

  if (
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp) &&
    Date.now() >= payload.exp * 1000
  ) {
    return redirectToLogin(req);
  }

  if (!knownRoles.has(payload.role as UserRole)) {
    return redirectToLogin(req);
  }

  const role = payload.role as UserRole;
  const roleBasedPath = getRoleRedirectPath(role);

  // Let the login page verify the token with the backend. This prevents a
  // revoked-session loop between "/" and a protected dashboard route.
  if (url.pathname === "/") {
    return NextResponse.next();
  }

  if (!url.pathname.startsWith(roleBasedPath)) {
    url.pathname = roleBasedPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/manager/:path*", "/supervisor/:path*", "/rep/:path*"],
};
