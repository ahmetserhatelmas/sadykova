import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteHomePackageButton } from "@/components/admin/DeleteHomePackageButton";
import { HomePackageForm } from "@/components/admin/HomePackageForm";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export default async function AdminEvPaketDuzenlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_packages")
    .select(
      "id,title,level_display,pill_start,pill_access,blurb,features,price_label,sort_order,published,cover_image_path",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const features = parseFeatures(row.features);
  const initial = {
    id: row.id,
    title: row.title,
    level_display: row.level_display,
    pill_start: row.pill_start,
    pill_access: row.pill_access,
    blurb: row.blurb,
    features_text: features.join("\n"),
    price_label: row.price_label,
    sort_order: row.sort_order,
    published: row.published,
    cover_image_path: row.cover_image_path,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/ev-paketleri"
          className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
        >
          ← Ev paketleri
        </Link>
        <DeleteHomePackageButton id={id} />
      </div>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Paketi düzenle
      </h1>
      <div className="mt-8">
        <HomePackageForm mode="edit" initial={initial} />
      </div>
    </div>
  );
}
