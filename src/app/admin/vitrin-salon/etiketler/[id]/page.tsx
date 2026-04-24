import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteShowcasePillButton } from "@/components/admin/DeleteShowcasePillButton";
import { ShowcasePillForm } from "@/components/admin/ShowcasePillForm";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function AdminShowcasePillDuzenlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_showcase_pills")
    .select("id,label,sort_order,published")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/vitrin-salon/etiketler"
          className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
        >
          ← Etiketler
        </Link>
        <DeleteShowcasePillButton id={id} />
      </div>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Etiketi düzenle
      </h1>
      <div className="mt-8">
        <ShowcasePillForm
          mode="edit"
          initial={{
            id: row.id,
            label: row.label,
            sort_order: row.sort_order,
            published: row.published,
          }}
        />
      </div>
    </div>
  );
}
