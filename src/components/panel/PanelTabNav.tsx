"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, UserRound } from "lucide-react";

const tabs = [
  {
    href: "/panel/programlar",
    label: "Programlarım",
    icon: LayoutGrid,
  },
  {
    href: "/panel/paketler",
    label: "Paketler",
    icon: Package,
  },
  {
    href: "/panel/profil",
    label: "Profil",
    icon: UserRound,
  },
] as const;

function tabActive(href: string, pathname: string) {
  if (href === "/panel/programlar") {
    return (
      pathname === "/panel/programlar" ||
      pathname.startsWith("/panel/programlar/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PanelTabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex w-full flex-col gap-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 md:w-52 md:shrink-0"
      aria-label="Üye paneli sekmeleri"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = tabActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
              active
                ? "bg-[#D1FF4E] text-black shadow-sm ring-1 ring-black/10"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2.25} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
