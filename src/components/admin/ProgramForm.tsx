"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";

function FileUploadField({
  label,
  accept,
  description,
  value,
  onChange,
  existingHint,
}: {
  label: string;
  accept: string;
  description: string;
  value: File | null;
  onChange: (f: File | null) => void;
  existingHint?: string | null;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-black/20 bg-[#F8F9FA] p-4 shadow-inner ring-1 ring-black/5 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-700">
        {label}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">{description}</p>
      {existingHint ? (
        <p className="mt-2 rounded-lg bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 ring-1 ring-black/5">
          Mevcut: <span className="font-mono text-zinc-900">{existingHint}</span>
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#D1FF4E] px-6 py-3 text-xs font-black uppercase text-black shadow-sm ring-1 ring-black/10 transition-[filter] hover:brightness-95 active:brightness-90"
        >
          Dosya seç
        </label>
        <div className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 ring-1 ring-black/5">
          {value ? (
            <span className="break-all text-black">{value.name}</span>
          ) : (
            <span className="text-zinc-500">Henüz dosya seçilmedi</span>
          )}
        </div>
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold uppercase text-zinc-700 hover:bg-zinc-50"
          >
            Kaldır
          </button>
        ) : null}
      </div>
    </div>
  );
}

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
      <FileUploadField
        label="Kapak görseli"
        accept="image/*"
        description="JPG, PNG veya WebP önerilir. Liste ve vitrinde görünür."
        value={coverFile}
        onChange={setCoverFile}
        existingHint={
          mode === "edit" && initial?.cover_image_path && !coverFile
            ? initial.cover_image_path.split("/").pop() ?? initial.cover_image_path
            : null
        }
      />
      <FileUploadField
        label="Video dosyası"
        accept="video/*"
        description="Üyelere açılacak ders videosu (ör. MP4). Yükleme biraz sürebilir."
        value={videoFile}
        onChange={setVideoFile}
        existingHint={
          mode === "edit" && initial?.video_path && !videoFile
            ? initial.video_path.split("/").pop() ?? initial.video_path
            : null
        }
      />
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
