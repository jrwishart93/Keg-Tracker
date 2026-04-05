import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL("/dashboard", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set("kt_demo", "1", {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
  });

  return response;
}
