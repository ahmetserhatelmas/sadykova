import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProgramMemberPreview } from "@/components/programs/ProgramMemberPreview";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export default async function PanelProgramPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/giris?next=/panel/programlar/${slug}`);

  const { data: program } = await supabase
    .from("programs")
    .select("id,title,slug,excerpt,cover_image_path,home_package_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!program) notFound();

  const { data: access } = await supabase
    .from("user_program_access")
    .select("program_id")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  let viaPackage = false;
  if (program.home_package_id && profile?.membership_tier) {
    const { data: hp } = await supabase
      .from("home_packages")
      .select("level_display")
      .eq("id", program.home_package_id)
      .maybeSingle();
    if (
      hp &&
      hp.level_display === String(profile.membership_tier)
    ) {
      viaPackage = true;
    }
  }

  if (!access && !viaPackage) {
    return (
      <div className="mt-10 rounded-[1.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-xl font-black uppercase">{program.title}</h1>
        <p className="mt-4 text-sm text-zinc-600">
          Bu programa erişim yetkiniz yok. Antrenörünüzden erişim talep edebilir
          veya paketinizi yükseltebilirsiniz.
        </p>
        <Link
          href="/panel/programlar"
          className="mt-6 inline-block text-sm font-bold underline"
        >
          Programlara dön
        </Link>
      </div>
    );
  }

  const { data: content } = await supabase
    .from("program_contents")
    .select("body, video_path")
    .eq("program_id", program.id)
    .maybeSingle();

  const cover = publicStorageUrl(program.cover_image_path);
  const videoUrl = content?.video_path
    ? publicStorageUrl(content.video_path)
    : null;

  return (
    <ProgramMemberPreview
      title={program.title}
      excerpt={program.excerpt}
      coverUrl={cover}
      videoUrl={videoUrl}
      body={content?.body ?? null}
      backHref="/panel/programlar"
      backLabel="Programlarım"
    />
  );
}
