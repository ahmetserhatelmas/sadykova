import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function pathWithEmailConfirmedParam(nextPath: string): string {
  const q = nextPath.indexOf("?");
  const path = q === -1 ? nextPath : nextPath.slice(0, q);
  const existing = q === -1 ? "" : nextPath.slice(q + 1);
  const params = new URLSearchParams(existing);
  params.set("onay", "eposta");
  return `${path}?${params.toString()}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/panel/programlar";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const type = searchParams.get("type");
      const isRecovery =
        type === "recovery" || next.includes("/sifre-yenile");
      const target = isRecovery ? next : pathWithEmailConfirmedParam(next);
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/giris?hata=oauth`);
}
