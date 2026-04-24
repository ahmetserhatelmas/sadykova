import { CheckCircle2, Lock, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Badge = { icon: "play" | "lock"; text: string };

type ListCard = {
  kind: "list";
  title: string;
  price: string;
  badges: Badge[];
  heading: string;
  points: string[];
  cta: string;
};

type SectionCard = {
  kind: "sections";
  title: string;
  price: string;
  badges: Badge[];
  sections: { title: string; items: string[] }[];
  cta: string;
};

function parseBadges(raw: unknown): Badge[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const icon = o.icon === "lock" ? "lock" : "play";
      const text = typeof o.text === "string" ? o.text : "";
      if (!text) return null;
      return { icon, text } as Badge;
    })
    .filter((x): x is Badge => x !== null);
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function parseSectionBlocks(raw: unknown): { title: string; items: string[] }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title : "";
      const items = parseStringArray(o.items);
      if (!title && items.length === 0) return null;
      return { title, items };
    })
    .filter((x): x is { title: string; items: string[] } => x !== null);
}

function rowToCard(row: {
  id: string;
  card_type: string;
  title: string;
  price_label: string;
  cta_label: string;
  badges: unknown;
  list_heading: string | null;
  list_points: unknown;
  section_blocks: unknown;
}): (ListCard | SectionCard) & { id: string } | null {
  const badges = parseBadges(row.badges);
  if (row.card_type === "list") {
    const points = parseStringArray(row.list_points);
    const heading =
      typeof row.list_heading === "string" && row.list_heading.trim()
        ? row.list_heading
        : "Program sonuçları:";
    return {
      id: row.id,
      kind: "list",
      title: row.title,
      price: row.price_label,
      badges,
      heading,
      points,
      cta: row.cta_label,
    };
  }
  if (row.card_type === "sections") {
    const sections = parseSectionBlocks(row.section_blocks);
    return {
      id: row.id,
      kind: "sections",
      title: row.title,
      price: row.price_label,
      badges,
      sections,
      cta: row.cta_label,
    };
  }
  return null;
}

function BadgeRow({ badges }: { badges: Badge[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b, i) => (
        <span
          key={`${i}-${b.icon}-${b.text}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-black ring-1 ring-black/5"
        >
          {b.icon === "play" ? (
            <Play className="h-3.5 w-3.5 fill-black text-black" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
          {b.text}
        </span>
      ))}
    </div>
  );
}

export async function ProgramShowcase() {
  const supabase = await createClient();

  const [pillsRes, cardsRes] = await Promise.all([
    supabase
      .from("home_showcase_pills")
      .select("label")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("home_showcase_cards")
      .select(
        "id,card_type,title,price_label,cta_label,badges,list_heading,list_points,section_blocks",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const pillLabels = (pillsRes.data ?? []).map((r) => r.label).filter(Boolean);
  const cards = (cardsRes.data ?? [])
    .map(rowToCard)
    .filter((c): c is (ListCard | SectionCard) & { id: string } => c !== null);

  if (cardsRes.error && cards.length === 0) {
    return (
      <section className="scroll-mt-20 bg-[#ECEEF1] px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-red-600">
            Vitrin kartları yüklenemedi. Supabase&apos;de{" "}
            <code className="rounded bg-zinc-200 px-1">005_home_showcase.sql</code>{" "}
            migration&apos;ını çalıştırın.
          </p>
        </div>
      </section>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-20 bg-[#ECEEF1] px-4 py-12 sm:px-8 lg:px-12">
      {pillLabels.length > 0 ? (
        <div className="mx-auto mb-8 max-w-6xl">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pillLabels.map((t) => (
              <span
                key={t}
                className="shrink-0 rounded-full bg-[#D1FF4E] px-4 py-2 text-[10px] font-bold uppercase text-black"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        {cards.map((card, index) => (
          <article
            key={card.id}
            id={
              index === 0 ? "okul" : index === 1 ? "salon" : undefined
            }
            className="relative scroll-mt-24 overflow-hidden rounded-[2rem] bg-[#F4F5F7] p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:pb-36"
          >
            <div className="relative z-10 max-w-full lg:max-w-[min(100%,28rem)]">
              <h2 className="text-xl font-black uppercase leading-tight tracking-tight text-black sm:text-2xl">
                {card.title}
              </h2>
              <div className="mt-4">
                <BadgeRow badges={card.badges} />
              </div>

              {card.kind === "list" ? (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-wide text-black">
                    {card.heading}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {card.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-2 text-sm font-medium leading-snug text-zinc-800"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#b8e034]"
                          strokeWidth={2.5}
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                card.sections.map((sec) => (
                  <div key={sec.title} className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-black">
                      {sec.title}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {sec.items.map((p) => (
                        <li
                          key={p}
                          className="flex gap-2 text-sm font-medium text-zinc-800"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#b8e034]"
                            strokeWidth={2.5}
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6 lg:absolute lg:bottom-6 lg:left-8 lg:right-8 lg:mt-0 lg:border-0 lg:pt-0">
              <div className="text-2xl font-black text-black">{card.price}</div>
              <button
                type="button"
                className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-bold uppercase text-black hover:brightness-95"
              >
                {card.cta}
              </button>
            </div>

            <div
              className="pointer-events-none absolute -bottom-4 right-0 hidden h-56 w-44 rounded-tl-3xl bg-gradient-to-tl from-zinc-300 to-zinc-200 sm:h-64 sm:w-52 lg:block"
              aria-hidden
            />
            <div className="pointer-events-none absolute bottom-0 right-4 hidden h-64 w-40 rounded-2xl bg-zinc-400/40 sm:right-8 sm:h-72 sm:w-48 lg:block" />
          </article>
        ))}
      </div>
    </section>
  );
}
