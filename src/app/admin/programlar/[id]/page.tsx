import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgramForm } from "@/components/admin/ProgramForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProgramEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: homePackages } = await supabase
    .from("home_packages")
    .select("id,title,level_display,sort_order")
    .order("sort_order");

  const { data: program } = await supabase
    .from("programs")
    .select(
      "id,title,slug,excerpt,price_label,sort_order,published,show_on_home,cover_image_path,home_package_id,list_group_title",
    )
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const { data: content } = await supabase
    .from("program_contents")
    .select("body, video_path")
    .eq("program_id", id)
    .maybeSingle();

  const initial = {
    id: program.id,
    title: program.title,
    slug: program.slug,
    excerpt: program.excerpt ?? "",
    price_label: program.price_label ?? "",
    sort_order: program.sort_order,
    published: program.published,
    show_on_home: program.show_on_home,
    body: content?.body ?? "",
    cover_image_path: program.cover_image_path,
    video_path: content?.video_path ?? null,
    home_package_id: program.home_package_id,
    list_group_title: program.list_group_title,
  };

  return (
    <div>
      <Link
        href="/admin/programlar"
        className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
      >
        ← Program listesi
      </Link>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Programı düzenle
      </h1>
      <div className="mt-8">
        <ProgramForm
          mode="edit"
          initial={initial}
          homePackages={homePackages ?? []}
        />
      </div>
    </div>
  );
}
