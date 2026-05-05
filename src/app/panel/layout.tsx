import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PanelTabNav } from "@/components/panel/PanelTabNav";
import { createClient } from "@/lib/supabase/server";
import { redirectIfEmailUnconfirmed } from "@/lib/supabase/require-email-confirmed";
import { site } from "@/lib/site";
import { formatTier } from "@/lib/membership";
import type { MembershipTier } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/panel");
  await redirectIfEmailUnconfirmed(supabase, user, "/panel");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, membership_tier")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const tier = (profile?.membership_tier ?? null) as MembershipTier | null;
  const displayName = profile?.full_name ?? user.email ?? "Üye";

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-black">
      <header className="border-b border-black/5 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-tight hover:opacity-80"
          >
            {site.brand}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full bg-[#D1FF4E] px-4 py-1.5 text-xs font-black uppercase hover:brightness-95"
              >
                Yönetim
              </Link>
            ) : null}
            <LogoutButton className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-black uppercase text-zinc-600 hover:border-black/20 hover:text-black disabled:opacity-60" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white via-white to-[#eef0e3] p-6 shadow-sm ring-1 ring-black/5 sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Üye paneli
            </p>
            <p className="mt-1 text-xl font-black text-black sm:text-2xl">
              Merhaba, {displayName}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              {tier ? (
                <>
                  Aktif paket etiketi:{" "}
                  <span className="font-semibold text-black">
                    {formatTier(tier)}
                  </span>
                </>
              ) : (
                <>Henüz atanmış paket etiketi yok — Paketler sekmesinden inceleyebilirsiniz.</>
              )}
            </p>
          </div>
          <Link
            href="/"
            prefetch={false}
            className="mt-6 inline-flex shrink-0 items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-zinc-50 sm:mt-0"
          >
            Ana site
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <aside className="md:sticky md:top-6 md:self-start">
            <PanelTabNav />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
