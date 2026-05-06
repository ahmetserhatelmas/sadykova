import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramMemberPreview } from "@/components/programs/ProgramMemberPreview";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProgramPreviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase
    .from("programs")
    .select("id,title,slug,excerpt,cover_image_path,published")
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const { data: content } = await supabase
    .from("program_contents")
    .select("body, video_path")
    .eq("program_id", id)
    .maybeSingle();

  const cover = publicStorageUrl(program.cover_image_path);
  const videoUrl = content?.video_path
    ? publicStorageUrl(content.video_path)
    : null;

  const noticeParts: string[] = [
    "Üye panelindeki program sayfasının önizlemesi. Erişim kontrolü yok; yalnızca yöneticiler görür.",
  ];
  if (!program.published) {
    noticeParts.push("Program taslak — üyeler listesinde görünmez, önizleme yine de güncel içeriği gösterir.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/programlar/${id}`}
            className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
          >
            ← Düzenlemeye dön
          </Link>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">
            Üye görünümü — önizleme
          </h1>
          <p className="mt-2 font-mono text-xs text-zinc-500">/{program.slug}</p>
        </div>
        <Link
          href={`/panel/programlar/${program.slug}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-50"
        >
          Üye URL’si (yeni sekme)
        </Link>
      </div>

      <ProgramMemberPreview
        title={program.title}
        excerpt={program.excerpt}
        coverUrl={cover}
        videoUrl={videoUrl}
        body={content?.body ?? null}
        backHref="/admin/programlar"
        backLabel="Program listesi"
        notice={noticeParts.join(" ")}
      />
    </div>
  );
}
