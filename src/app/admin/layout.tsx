import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { redirectIfEmailUnconfirmed } from "@/lib/supabase/require-email-confirmed";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/admin");
  await redirectIfEmailUnconfirmed(supabase, user, "/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/panel/programlar");

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="border-b border-black/10 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="text-sm font-black uppercase">
            Yönetim · {site.brand}
          </Link>
          <nav className="flex flex-wrap gap-3 text-xs font-bold uppercase">
            <Link href="/admin/programlar" className="hover:underline">
              Programlar
            </Link>
            <Link href="/admin/uyeler" className="hover:underline">
              Üyeler ve erişim
            </Link>
            <Link href="/admin/ev-paketleri" className="hover:underline">
              Ev paketleri
            </Link>
            <Link href="/admin/vitrin-salon" className="hover:underline">
              Salon vitrini
            </Link>
            <Link href="/admin/mesajlar" className="hover:underline">
              Mesajlar
            </Link>
            <Link href="/panel/programlar" className="text-zinc-500 hover:text-black">
              Üye paneli
            </Link>
            <LogoutButton className="text-zinc-500 hover:text-black disabled:opacity-60" />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
