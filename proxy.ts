import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login"]);
PUBLIC_ROUTES.add("/how-it-works");

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }

  const hasAccess = Boolean(request.cookies.get("kt_session")?.value);
  const role = request.cookies.get("kt_role")?.value;

  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/keg/");

  if (!hasAccess && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasAccess && isPublicRoute) {
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
