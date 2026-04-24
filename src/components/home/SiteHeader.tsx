import Link from "next/link";
import { Dumbbell, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";

const nav = [
  { href: "#okul", label: "Kilo Verme ve Kütle Okulu" },
  { href: "#ev", label: "Ev Programları" },
  { href: "#salon", label: "Spor Salonu Programları" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-2 shrink-0" prefetch={false}>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#D1FF4E]"
          aria-hidden
        >
          <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="text-lg font-black tracking-tight text-black sm:text-xl">
          {site.brand}
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-wide text-black md:flex">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:opacity-70 transition-opacity"
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <Link
            href="/panel/programlar"
            prefetch={false}
            className="rounded-full bg-[#D1FF4E] px-5 py-2 text-black hover:brightness-95 transition-[filter]"
          >
            Panel
          </Link>
        ) : (
          <Link
            href="/giris"
            className="rounded-full bg-[#D1FF4E] px-5 py-2 text-black hover:brightness-95 transition-[filter]"
          >
            Giriş Yap
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {user ? (
          <Link
            href="/panel/programlar"
            prefetch={false}
            className="rounded-full bg-[#D1FF4E] px-4 py-2 text-xs font-bold uppercase text-black md:hidden"
          >
            Panel
          </Link>
        ) : (
          <Link
            href="/giris"
            className="rounded-full bg-[#D1FF4E] px-4 py-2 text-xs font-bold uppercase text-black md:hidden"
          >
            Giriş
          </Link>
        )}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 md:hidden"
          aria-label="Menü"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
