import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteShowcaseCardButton } from "@/components/admin/DeleteShowcaseCardButton";
import { ShowcaseCardForm } from "@/components/admin/ShowcaseCardForm";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

type IconOpt = "play" | "lock";

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function parseBadges(raw: unknown): { icon: IconOpt; text: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const icon = o.icon === "lock" ? "lock" : "play";
      const text = typeof o.text === "string" ? o.text : "";
      if (!text) return null;
      return { icon, text };
    })
    .filter((x): x is { icon: IconOpt; text: string } => x !== null);
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

export default async function AdminShowcaseCardDuzenlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_showcase_cards")
    .select(
      "id,card_type,title,price_label,cta_label,badges,list_heading,list_points,section_blocks,sort_order,published",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const badges = parseBadges(row.badges);
  const badge1 = badges[0] ?? { icon: "play" as const, text: "" };
  const badge2 = badges[1] ?? { icon: "lock" as const, text: "" };

  const listPoints = parseStringArray(row.list_points);
  const blocks = parseSectionBlocks(row.section_blocks);
  const section_blocks =
    blocks.length > 0
      ? blocks.map((b) => ({
          title: b.title,
          itemsText: b.items.join("\n"),
        }))
      : [
          { title: "", itemsText: "" },
          { title: "", itemsText: "" },
        ];

  const cardType =
    row.card_type === "sections" ? "sections" : "list";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/vitrin-salon/kartlar"
          className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
        >
          ← Kartlar
        </Link>
        <DeleteShowcaseCardButton id={id} />
      </div>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Kartı düzenle
      </h1>
      <div className="mt-8">
        <ShowcaseCardForm
          mode="edit"
          initial={{
            id: row.id,
            card_type: cardType,
            title: row.title,
            price_label: row.price_label,
            cta_label: row.cta_label,
            sort_order: row.sort_order,
            published: row.published,
            badge1_icon: badge1.icon,
            badge1_text: badge1.text,
            badge2_icon: badge2.icon,
            badge2_text: badge2.text,
            list_heading: row.list_heading ?? "",
            list_points_text: listPoints.join("\n"),
            section_blocks,
          }}
        />
      </div>
    </div>
  );
}
