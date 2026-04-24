import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  full_name: string;
  email: string;
  message: string;
  created_at: string;
};

export default async function AdminMesajlarPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("contact_messages")
    .select("id, full_name, email, message, created_at")
    .order("created_at", { ascending: false });

  const list = (rows ?? []) as Row[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Mesajlar
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            İletişim formundan gelen talepler. E-posta adresine tıklayarak hızlıca
            yanıt açabilirsiniz.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
        >
          ← Özet
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Mesajlar yüklenemedi. Supabase&apos;de{" "}
          <code className="rounded bg-amber-100 px-1">contact_messages</code>{" "}
          tablosu ve migration&apos;ın çalıştığından emin olun.
        </div>
      ) : null}

      {list.length === 0 && !error ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center text-sm text-zinc-600 shadow-sm ring-1 ring-black/5">
          Henüz iletişim mesajı yok.
        </div>
      ) : null}

      {list.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {list.map((m) => {
            const tarih = new Date(m.created_at).toLocaleString("tr-TR", {
              dateStyle: "medium",
              timeStyle: "short",
            });
            return (
              <li
                key={m.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/5 pb-3">
                  <div>
                    <p className="font-bold text-black">{m.full_name}</p>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: İletişim talebi")}`}
                      className="text-sm font-medium text-[#2d5a45] underline-offset-2 hover:underline"
                    >
                      {m.email}
                    </a>
                  </div>
                  <time
                    dateTime={m.created_at}
                    className="text-xs font-medium text-zinc-500"
                  >
                    {tarih}
                  </time>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                  {m.message}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
