import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
