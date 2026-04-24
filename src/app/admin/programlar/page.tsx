import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("programs")
    .select("id,title,slug,published,sort_order")
    .order("sort_order");

  const rows = programs ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Programlar
        </h1>
        <Link
          href="/admin/programlar/yeni"
          className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-black uppercase hover:brightness-95"
        >
          Yeni program
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-black/10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {rows.length === 0 ? (
          <li className="p-8 text-sm text-zinc-600">Henüz program yok.</li>
        ) : (
          rows.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
            >
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-zinc-500">
                  /{p.slug} · {p.published ? "Yayında" : "Taslak"}
                </p>
              </div>
              <Link
                href={`/admin/programlar/${p.id}`}
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
