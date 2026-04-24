import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/site";

type ProgramRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_path: string | null;
};

export default async function PanelProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/panel/programlar");

  const { data: accessRows } = await supabase
    .from("user_program_access")
    .select("program_id")
    .eq("user_id", user.id);

  const ids = accessRows?.map((r) => r.program_id).filter(Boolean) ?? [];

  let list: ProgramRow[] = [];
  if (ids.length > 0) {
    const { data: programs } = await supabase
      .from("programs")
      .select("id,title,slug,excerpt,cover_image_path")
      .in("id", ids)
      .order("sort_order");
    list = programs ?? [];
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            Programlarım
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Size atanan antrenman ve beslenme programlarına buradan ulaşın.
            Sorularınız için{" "}
            <Link href="/iletisim" className="font-semibold text-black underline">
              iletişim
            </Link>{" "}
            sayfasını kullanabilirsiniz.
          </p>
        </div>
        {list.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-zinc-600 ring-1 ring-black/5">
            <Sparkles className="h-3.5 w-3.5 text-[#6a7a00]" />
            {list.length} program
          </span>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white to-zinc-50 p-10 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D1FF4E]/40 text-black">
            <LayoutGrid className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <p className="mt-6 text-base font-semibold text-black">
            Henüz atanmış program yok
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            Antrenörünüz size erişim verdiğinde programlar burada listelenir.
            Paket satın almak veya bilgi almak için{" "}
            <Link
              href="/panel/paketler"
              className="font-semibold text-black underline"
            >
              Paketler
            </Link>{" "}
            sekmesine göz atın.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/panel/paketler"
              className="inline-flex rounded-full bg-[#D1FF4E] px-6 py-2.5 text-xs font-black uppercase text-black hover:brightness-95"
            >
              Paketleri incele
            </Link>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex rounded-full border border-black/10 bg-white px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-zinc-50"
            >
              Ana sayfa
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {list.map((p) => {
            const img = publicStorageUrl(p.cover_image_path);
            return (
              <li key={p.id}>
                <Link
                  href={`/panel/programlar/${p.slug}`}
                  className="group flex h-full gap-4 rounded-[1.35rem] bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10"
                >
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase text-zinc-500">
                        Görsel
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h2 className="font-bold text-black group-hover:underline">
                      {p.title}
                    </h2>
                    {p.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-3 inline-flex items-center text-xs font-black uppercase text-[#5c6b00]">
                      İçeriği aç →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
