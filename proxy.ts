import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login"]);
const PASSWORD_CHANGE_ROUTE = "/change-password";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(request.cookies.get("kt_session")?.value);
  const isDemoMode = request.cookies.get("kt_demo")?.value === "1";
  const hasAccess = isAuthenticated || isDemoMode;
  const requiresPasswordChange = request.cookies.get("kt_requires_password_change")?.value === "1";
  const role = request.cookies.get("kt_role")?.value;

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isPasswordChangeRoute = pathname === PASSWORD_CHANGE_ROUTE;

  if (!hasAccess && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasAccess && isPublicRoute) {
    const destination = isAuthenticated && requiresPasswordChange ? PASSWORD_CHANGE_ROUTE : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Force first-login password updates before allowing normal app navigation.
  if (isAuthenticated && requiresPasswordChange && !isPasswordChangeRoute) {
    return NextResponse.redirect(new URL(PASSWORD_CHANGE_ROUTE, request.url));
  }

  if (isAuthenticated && !requiresPasswordChange && isPasswordChangeRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Minimal role-aware route gating for future admin features.
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
