import Link from "next/link";
import { DeleteProgramButton } from "@/components/admin/DeleteProgramButton";
import { createClient } from "@/lib/supabase/server";

type ProgramListRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sort_order: number;
  list_group_title: string | null;
  home_packages: { title: string; sort_order: number } | null;
};

function normalizeProgramListRow(
  r: Record<string, unknown>,
): ProgramListRow {
  const raw = r.home_packages;
  const home_packages = Array.isArray(raw)
    ? (raw[0] as ProgramListRow["home_packages"])
    : (raw as ProgramListRow["home_packages"]);
  return {
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    published: r.published as boolean,
    sort_order: r.sort_order as number,
    list_group_title: (r.list_group_title as string | null) ?? null,
    home_packages: home_packages ?? null,
  };
}

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("programs")
    .select(
      "id,title,slug,published,sort_order,list_group_title,home_packages(title,sort_order)",
    )
    .order("sort_order");

  const rows = (programs ?? []).map((p) =>
    normalizeProgramListRow(p as Record<string, unknown>),
  );

  const sorted = [...rows].sort((a, b) => {
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

  const byPackage = new Map<string, ProgramListRow[]>();
  for (const r of sorted) {
    const key = r.home_packages?.title ?? "Paket atanmamış";
    if (!byPackage.has(key)) byPackage.set(key, []);
    byPackage.get(key)!.push(r);
  }

  const packageOrder = [...byPackage.keys()].sort((a, b) => {
    if (a === "Paket atanmamış") return 1;
    if (b === "Paket atanmamış") return -1;
    const sa =
      sorted.find((r) => (r.home_packages?.title ?? "Paket atanmamış") === a)
        ?.home_packages?.sort_order ?? 999;
    const sb =
      sorted.find((r) => (r.home_packages?.title ?? "Paket atanmamış") === b)
        ?.home_packages?.sort_order ?? 999;
    return sa - sb;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Programlar
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Ev paketi ve isteğe bağlı grup başlığına göre sıralanır. Üyeler, profil
            paket etiketleriyle eşleşen programları otomatik görür.
          </p>
        </div>
        <Link
          href="/admin/programlar/yeni"
          className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-black uppercase hover:brightness-95"
        >
          Yeni program
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-8 text-sm text-zinc-600 shadow-sm ring-1 ring-black/5">
          Henüz program yok.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {packageOrder.map((pkgTitle) => {
            const pkgRows = byPackage.get(pkgTitle)!;
            const byGroup = new Map<string, ProgramListRow[]>();
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
                      {gTitle !== "Genel" || pkgRows.some((r) => r.list_group_title) ? (
                        <h3 className="mb-2 text-xs font-bold uppercase text-zinc-500">
                          {gTitle}
                        </h3>
                      ) : null}
                      <ul className="divide-y divide-black/10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        {byGroup.get(gTitle)!.map((p) => (
                          <li
                            key={p.id}
                            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
                          >
                            <div>
                              <p className="font-bold">{p.title}</p>
                              <p className="text-xs text-zinc-500">
                                /{p.slug} ·{" "}
                                {p.published ? "Yayında" : "Taslak"}
                                {p.list_group_title ? (
                                  <> · {p.list_group_title}</>
                                ) : null}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                              <Link
                                href={`/admin/programlar/${p.id}`}
                                className="text-xs font-bold uppercase text-[#6a7a00] hover:underline"
                              >
                                Düzenle
                              </Link>
                              <DeleteProgramButton id={p.id} title={p.title} />
                            </div>
                          </li>
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
