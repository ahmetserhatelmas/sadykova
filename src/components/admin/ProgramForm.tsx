"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";

type Initial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  price_label: string;
  sort_order: number;
  published: boolean;
  show_on_home: boolean;
  body: string;
  cover_image_path: string | null;
  video_path: string | null;
};

export function ProgramForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [priceLabel, setPriceLabel] = useState(initial?.price_label ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [showOnHome, setShowOnHome] = useState(initial?.show_on_home ?? true);
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function syncSlugFromTitle() {
    setSlug(slugify(title));
  }

  async function upload(path: string, file: File) {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("program-media")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const supabase = createClient();
    const finalSlug = slug.trim() || slugify(title);

    try {
      if (mode === "create") {
        const { data: prog, error: pErr } = await supabase
          .from("programs")
          .insert({
            title,
            slug: finalSlug,
            excerpt: excerpt || null,
            price_label: priceLabel || null,
            sort_order: sortOrder,
            published,
            show_on_home: showOnHome,
          })
          .select("id")
          .single();
        if (pErr) throw pErr;
        if (!prog) throw new Error("Program oluşturulamadı");
        const id = prog.id;

        let coverPath = null as string | null;
        let videoPath = null as string | null;
        if (coverFile) {
          const ext = coverFile.name.split(".").pop() || "jpg";
          coverPath = `covers/${id}/kapak.${ext}`;
          await upload(coverPath, coverFile);
        }
        if (videoFile) {
          const ext = videoFile.name.split(".").pop() || "mp4";
          videoPath = `videos/${id}/ders.${ext}`;
          await upload(videoPath, videoFile);
        }

        if (coverPath) {
          await supabase
            .from("programs")
            .update({ cover_image_path: coverPath })
            .eq("id", id);
        }

        const { error: cErr } = await supabase.from("program_contents").insert({
          program_id: id,
          body: body || null,
          video_path: videoPath,
        });
        if (cErr) throw cErr;
        setMsg("Program oluşturuldu.");
        router.push(`/admin/programlar/${id}`);
        router.refresh();
      } else if (initial) {
        const id = initial.id;
        let coverPath = initial.cover_image_path;
        let videoPath = initial.video_path;

        if (coverFile) {
          const ext = coverFile.name.split(".").pop() || "jpg";
          coverPath = `covers/${id}/kapak.${ext}`;
          await upload(coverPath, coverFile);
        }
        if (videoFile) {
          const ext = videoFile.name.split(".").pop() || "mp4";
          videoPath = `videos/${id}/ders.${ext}`;
          await upload(videoPath, videoFile);
        }

        const { error: uErr } = await supabase
          .from("programs")
          .update({
            title,
            slug: finalSlug,
            excerpt: excerpt || null,
            price_label: priceLabel || null,
            sort_order: sortOrder,
            published,
            show_on_home: showOnHome,
            cover_image_path: coverPath,
          })
          .eq("id", id);
        if (uErr) throw uErr;

        const { error: upc } = await supabase.from("program_contents").upsert(
          {
            program_id: id,
            body: body || null,
            video_path: videoPath,
          },
          { onConflict: "program_id" },
        );
        if (upc) throw upc;
        setMsg("Kaydedildi.");
        router.refresh();
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Bir hata oluştu");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Başlık
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <label className="block flex-1 min-w-[200px] text-xs font-bold uppercase text-zinc-500">
          URL kodu (slug)
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="otomatik-olustur"
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={syncSlugFromTitle}
          className="self-end rounded-full border border-black/10 px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-50"
        >
          Başlıktan üret
        </button>
      </div>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Kısa açıklama (liste / vitrin)
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Üye alanı — detay metni
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase text-zinc-500">
          Fiyat etiketi (örn. 1.990 ₺)
          <input
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-bold uppercase text-zinc-500">
          Sıra no
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Yayında (herkes başlığı görebilir)
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={showOnHome}
          onChange={(e) => setShowOnHome(e.target.checked)}
        />
        Ana vitrinde göster
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Kapak görseli
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Video dosyası
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </label>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#D1FF4E] px-6 py-2.5 text-xs font-black uppercase hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Güncelle"}
      </button>
    </form>
  );
}
