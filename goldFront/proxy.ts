import { NextRequest, NextResponse } from "next/server";
import { getRoleRedirectPath } from "./features/auth/lib/types/roles"
import { UserRole } from "@/lib/types"

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value;

  // If no token, redirect all protected routes to login
  if (!token) {
    if (url.pathname !== "/") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Decode JWT payload (without verifying — ok for routing)
  let payload: { role: UserRole } = { role: "MEDICAL_REP" };
  try {
    payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    // Invalid token → clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("token");
    return response;
  }

  const role = payload.role;
  const roleBasedPath = getRoleRedirectPath(role);

  // If user is logged in and tries to access login page, redirect to their dashboard
  if (url.pathname === "/") {
    url.pathname = roleBasedPath;
    return NextResponse.redirect(url);
  }

  // Role-based route protection - prevent access to other roles' routes
  const path = url.pathname;

  if (!path.startsWith(roleBasedPath)) {
    url.pathname = roleBasedPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/manager/:path*", "/supervisor/:path*", "/rep/:path*"],
};
