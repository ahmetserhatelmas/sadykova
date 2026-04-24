"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  id: string;
  title: string;
  level_display: string;
  pill_start: string;
  pill_access: string;
  blurb: string;
  features_text: string;
  price_label: string;
  sort_order: number;
  published: boolean;
  cover_image_path: string | null;
};

export function HomePackageForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [levelDisplay, setLevelDisplay] = useState(initial?.level_display ?? "1");
  const [pillStart, setPillStart] = useState(initial?.pill_start ?? "");
  const [pillAccess, setPillAccess] = useState(initial?.pill_access ?? "");
  const [blurb, setBlurb] = useState(initial?.blurb ?? "");
  const [featuresText, setFeaturesText] = useState(
    initial?.features_text ?? "",
  );
  const [priceLabel, setPriceLabel] = useState(initial?.price_label ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function featuresToJson(): string[] {
    return featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
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
    const features = featuresToJson();

    try {
      if (mode === "create") {
        const { data: row, error: insErr } = await supabase
          .from("home_packages")
          .insert({
            title,
            level_display: levelDisplay.trim() || "1",
            pill_start: pillStart,
            pill_access: pillAccess,
            blurb,
            features,
            price_label: priceLabel,
            sort_order: sortOrder,
            published,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        if (!row) throw new Error("Kayıt oluşturulamadı");
        const id = row.id;

        let coverPath = null as string | null;
        if (coverFile) {
          const ext = coverFile.name.split(".").pop() || "jpg";
          coverPath = `home-packages/${id}/kapak.${ext}`;
          await upload(coverPath, coverFile);
          await supabase
            .from("home_packages")
            .update({ cover_image_path: coverPath })
            .eq("id", id);
        }
        setMsg("Paket oluşturuldu.");
        router.push(`/admin/ev-paketleri/${id}`);
        router.refresh();
      } else if (initial) {
        const id = initial.id;
        let coverPath = initial.cover_image_path;
        if (coverFile) {
          const ext = coverFile.name.split(".").pop() || "jpg";
          coverPath = `home-packages/${id}/kapak.${ext}`;
          await upload(coverPath, coverFile);
        }
        const { error: upErr } = await supabase
          .from("home_packages")
          .update({
            title,
            level_display: levelDisplay.trim() || "1",
            pill_start: pillStart,
            pill_access: pillAccess,
            blurb,
            features,
            price_label: priceLabel,
            sort_order: sortOrder,
            published,
            cover_image_path: coverPath,
          })
          .eq("id", id);
        if (upErr) throw upErr;
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
      className="max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Paket adı
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase text-zinc-500">
          Seviye (yuvarlak içindeki rakam)
          <input
            value={levelDisplay}
            onChange={(e) => setLevelDisplay(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            placeholder="1"
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
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Başlangıç metni (▶ ile)
        <input
          required
          value={pillStart}
          onChange={(e) => setPillStart(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Erişim metni (kilit ile)
        <input
          required
          value={pillAccess}
          onChange={(e) => setPillAccess(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Kısa açıklama
        <textarea
          required
          rows={3}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Özellikler (her satır bir madde, yeşil tik)
        <textarea
          required
          rows={6}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-mono text-xs"
          placeholder={"Madde 1\nMadde 2"}
        />
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Fiyat etiketi
        <input
          required
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="1.990 ₺"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Ana sayfada yayında
      </label>
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Kapak görseli (isteğe bağlı)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
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
