"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  id: string;
  label: string;
  sort_order: number;
  published: boolean;
};

export function ShowcasePillForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "create") {
        const { data, error } = await supabase
          .from("home_showcase_pills")
          .insert({ label, sort_order: sortOrder, published })
          .select("id")
          .single();
        if (error) throw error;
        if (!data) throw new Error("Kayıt oluşturulamadı");
        setMsg("Etiket oluşturuldu.");
        router.push(`/admin/vitrin-salon/etiketler/${data.id}`);
        router.refresh();
      } else if (initial) {
        const { error } = await supabase
          .from("home_showcase_pills")
          .update({ label, sort_order: sortOrder, published })
          .eq("id", initial.id);
        if (error) throw error;
        setMsg("Kaydedildi.");
        router.refresh();
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <label className="block text-sm font-bold">
        Metin
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm font-bold">
        Sıra
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Yayında
      </label>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#D1FF4E] px-5 py-2.5 text-xs font-black uppercase hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "…" : mode === "create" ? "Oluştur" : "Kaydet"}
      </button>
    </form>
  );
}
