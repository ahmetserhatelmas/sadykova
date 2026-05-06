import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEvPaketleriPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("home_packages")
    .select("id,title,level_display,price_label,sort_order,published")
    .order("sort_order", { ascending: true });

  const list = rows ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Ev paketleri (vitrin)
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Ana sayfadaki üçlü kart bölümü. Sıra numarası listeleme düzenini
            belirler.
          </p>
        </div>
        <Link
          href="/admin/ev-paketleri/yeni"
          className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-black uppercase hover:brightness-95"
        >
          Yeni paket
        </Link>
      </div>

      {error ? (
        <p className="mt-8 text-sm text-red-600">
          Tablo bulunamadı veya erişim yok.{" "}
          <code className="rounded bg-zinc-200 px-1">004_home_packages.sql</code>{" "}
          migration&apos;ını çalıştırın.
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-black/10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {list.length === 0 && !error ? (
          <li className="p-8 text-sm text-zinc-600">Henüz paket yok.</li>
        ) : (
          list.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
            >
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-zinc-500">
                  Seviye {p.level_display} · {p.price_label} · sıra {p.sort_order}{" "}
                  · {p.published ? "yayında" : "taslak"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href={`/admin/ev-paketleri/${p.id}/onizleme`}
                  className="text-xs font-bold uppercase text-zinc-600 hover:text-black hover:underline"
                >
                  Önizle
                </Link>
                <Link
                  href={`/admin/ev-paketleri/${p.id}`}
                  className="text-xs font-bold uppercase text-[#6a7a00] hover:underline"
                >
                  Düzenle
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
