"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const base =
  "rounded-full px-4 py-1.5 text-xs font-black uppercase transition-[filter,colors]";

export function PanelAdminLink() {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  return (
    <Link
      href="/admin"
      prefetch={false}
      className={
        onAdmin
          ? `${base} bg-[#D1FF4E] text-black hover:brightness-95`
          : `${base} border border-black/10 bg-white text-zinc-600 hover:border-black/20 hover:text-black`
      }
    >
      Yönetim
    </Link>
  );
}
