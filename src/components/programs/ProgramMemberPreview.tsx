import Link from "next/link";
import { escapeAndNl2br } from "@/lib/safe-html";

type Props = {
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  body: string | null;
  backHref: string;
  backLabel: string;
  /** Üstte bilgi bandı (örn. taslak önizleme) */
  notice?: string | null;
};

export function ProgramMemberPreview({
  title,
  excerpt,
  coverUrl,
  videoUrl,
  body,
  backHref,
  backLabel,
  notice,
}: Props) {
  return (
    <article className="mt-8">
      {notice ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {notice}
        </p>
      ) : null}
      <Link
        href={backHref}
        className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
      >
        ← {backLabel}
      </Link>
      <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-black">
        {title}
      </h1>
      {excerpt ? <p className="mt-3 text-zinc-600">{excerpt}</p> : null}
      {coverUrl ? (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      ) : null}
      {videoUrl ? (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-[1.5rem] bg-black ring-1 ring-black/5">
          <video
            src={videoUrl}
            controls
            className="h-full w-full"
            playsInline
          />
        </div>
      ) : null}
      {body ? (
        <div
          className="prose prose-zinc mt-8 max-w-none rounded-[1.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5 prose-p:text-zinc-700"
          dangerouslySetInnerHTML={{ __html: escapeAndNl2br(body) }}
        />
      ) : (
        <p className="mt-8 text-sm text-zinc-500">
          Bu program için henüz yazılı içerik eklenmemiş.
        </p>
      )}
    </article>
  );
}
