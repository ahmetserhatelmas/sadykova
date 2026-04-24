import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShowcasePillsPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("home_showcase_pills")
    .select("id,label,sort_order,published")
    .order("sort_order", { ascending: true });

  const list = rows ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/vitrin-salon"
            className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
          >
            ← Vitrin
          </Link>
          <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
            Üst etiketler
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Ana sayfada kartların üstündeki yatay yeşil etiketler.
          </p>
        </div>
        <Link
          href="/admin/vitrin-salon/etiketler/yeni"
          className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-black uppercase hover:brightness-95"
        >
          Yeni etiket
        </Link>
      </div>

      {error ? (
        <p className="mt-8 text-sm text-red-600">
          Tablo yok veya erişim yok.{" "}
          <code className="rounded bg-zinc-200 px-1">005_home_showcase.sql</code>{" "}
          çalıştırın.
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-black/10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {list.length === 0 && !error ? (
          <li className="p-8 text-sm text-zinc-600">Henüz etiket yok.</li>
        ) : (
          list.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
            >
              <div>
                <p className="font-bold">{p.label}</p>
                <p className="text-xs text-zinc-500">
                  sıra {p.sort_order} · {p.published ? "yayında" : "taslak"}
                </p>
              </div>
              <Link
                href={`/admin/vitrin-salon/etiketler/${p.id}`}
                className="text-xs font-bold uppercase text-[#6a7a00] hover:underline"
              >
                Düzenle
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
