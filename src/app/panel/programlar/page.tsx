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
  list_group_title: string | null;
  sort_order: number;
  home_packages: { title: string; sort_order: number } | null;
};

function normalizePanelProgram(
  r: Record<string, unknown>,
): ProgramRow {
  const raw = r.home_packages;
  const home_packages = Array.isArray(raw)
    ? (raw[0] as ProgramRow["home_packages"])
    : (raw as ProgramRow["home_packages"]);
  return {
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    excerpt: (r.excerpt as string | null) ?? null,
    cover_image_path: (r.cover_image_path as string | null) ?? null,
    list_group_title: (r.list_group_title as string | null) ?? null,
    sort_order: r.sort_order as number,
    home_packages: home_packages ?? null,
  };
}

function PanelProgramCard({ program: p }: { program: ProgramRow }) {
  const img = publicStorageUrl(p.cover_image_path);
  return (
    <li>
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
}

export default async function PanelProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/panel/programlar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  const tier = profile?.membership_tier;

  const { data: accessRows } = await supabase
    .from("user_program_access")
    .select("program_id")
    .eq("user_id", user.id);

  const accessIds = new Set(
    accessRows?.map((r) => r.program_id).filter(Boolean) ?? [],
  );

  let packageProgramIds: string[] = [];
  if (tier) {
    const { data: hp } = await supabase
      .from("home_packages")
      .select("id")
      .eq("level_display", String(tier))
      .maybeSingle();
    if (hp?.id) {
      const { data: pkgProgs } = await supabase
        .from("programs")
        .select("id")
        .eq("home_package_id", hp.id);
      packageProgramIds = pkgProgs?.map((p) => p.id) ?? [];
    }
  }

  const allIds = [...new Set([...accessIds, ...packageProgramIds])];

  let list: ProgramRow[] = [];
  if (allIds.length > 0) {
    const { data: programs } = await supabase
      .from("programs")
      .select(
        "id,title,slug,excerpt,cover_image_path,list_group_title,sort_order,home_packages(title,sort_order)",
      )
      .in("id", allIds);
    list = (programs ?? []).map((p) =>
      normalizePanelProgram(p as Record<string, unknown>),
    );
  }

  list.sort((a, b) => {
    const pa =
      (a.home_packages?.sort_order ?? 999) -
      (b.home_packages?.sort_order ?? 999);
    if (pa !== 0) return pa;
    const ga = (a.list_group_title ?? "").localeCompare(
      b.list_group_title ?? "",
      "tr",
    );
    if (ga !== 0) return ga;
    return a.sort_order - b.sort_order;
  });

  const byPackage = new Map<string, ProgramRow[]>();
  for (const r of list) {
    const key = r.home_packages?.title ?? "Atanan içerikler";
    if (!byPackage.has(key)) byPackage.set(key, []);
    byPackage.get(key)!.push(r);
  }

  const packageOrder = [...byPackage.keys()].sort((a, b) => {
    if (a === "Atanan içerikler") return 1;
    if (b === "Atanan içerikler") return -1;
    const sa =
      list.find((r) => (r.home_packages?.title ?? "Atanan içerikler") === a)
        ?.home_packages?.sort_order ?? 999;
    const sb =
      list.find((r) => (r.home_packages?.title ?? "Atanan içerikler") === b)
        ?.home_packages?.sort_order ?? 999;
    return sa - sb;
  });

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            Programlarım
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Paketinize tanımlı programlar ve size özel açılan içerikler burada
            listelenir. Sorularınız için{" "}
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
            Üyelik paketiniz (profil) bir ev paketiyle eşleştiğinde o paketteki
            programlar burada görünür. Ayrıca antrenörünüz size tek tek erişim
            verebilir.{" "}
            <Link
              href="/panel/paketler"
              className="font-semibold text-black underline"
            >
              Paketler
            </Link>{" "}
            sekmesinden bilgi alabilirsiniz.
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
        <div className="mt-8 space-y-10">
          {packageOrder.map((pkgTitle) => {
            const pkgRows = byPackage.get(pkgTitle)!;
            const byGroup = new Map<string, ProgramRow[]>();
            for (const r of pkgRows) {
              const g = r.list_group_title?.trim() || "Genel";
              if (!byGroup.has(g)) byGroup.set(g, []);
              byGroup.get(g)!.push(r);
            }
            const groupKeys = [...byGroup.keys()].sort((a, b) =>
              a.localeCompare(b, "tr"),
            );

            return (
              <section key={pkgTitle}>
                <h2 className="border-b border-black/10 pb-2 text-sm font-black uppercase tracking-wide text-zinc-800">
                  {pkgTitle}
                </h2>
                <div className="mt-4 space-y-6">
                  {groupKeys.map((gTitle) => (
                    <div key={`${pkgTitle}-${gTitle}`}>
                      {gTitle !== "Genel" ||
                      pkgRows.some((r) => r.list_group_title) ? (
                        <h3 className="mb-3 text-xs font-bold uppercase text-zinc-500">
                          {gTitle}
                        </h3>
                      ) : null}
                      <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                        {byGroup.get(gTitle)!.map((p) => (
                          <PanelProgramCard key={p.id} program={p} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
