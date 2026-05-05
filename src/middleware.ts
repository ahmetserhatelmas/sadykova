import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  // Supabase bazen Site URL köküne (?code=) yönlendirir; oturumu /auth/callback işlesin.
  if (url.pathname === "/" && url.searchParams.get("code")) {
    const to = url.clone();
    to.pathname = "/auth/callback";
    return NextResponse.redirect(to);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
