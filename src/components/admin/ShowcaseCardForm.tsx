"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type IconOpt = "play" | "lock";

type SectionBlock = { title: string; itemsText: string };

type Initial = {
  id: string;
  card_type: "list" | "sections";
  title: string;
  price_label: string;
  cta_label: string;
  sort_order: number;
  published: boolean;
  badge1_icon: IconOpt;
  badge1_text: string;
  badge2_icon: IconOpt;
  badge2_text: string;
  list_heading: string;
  list_points_text: string;
  section_blocks: SectionBlock[];
};

function defaultSections(): SectionBlock[] {
  return [
    { title: "", itemsText: "" },
    { title: "", itemsText: "" },
  ];
}

export function ShowcaseCardForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const router = useRouter();
  const [cardType, setCardType] = useState<"list" | "sections">(
    initial?.card_type ?? "list",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priceLabel, setPriceLabel] = useState(initial?.price_label ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.cta_label ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [b1Icon, setB1Icon] = useState<IconOpt>(initial?.badge1_icon ?? "play");
  const [b1Text, setB1Text] = useState(initial?.badge1_text ?? "");
  const [b2Icon, setB2Icon] = useState<IconOpt>(initial?.badge2_icon ?? "lock");
  const [b2Text, setB2Text] = useState(initial?.badge2_text ?? "");
  const [listHeading, setListHeading] = useState(initial?.list_heading ?? "");
  const [listPointsText, setListPointsText] = useState(
    initial?.list_points_text ?? "",
  );
  const [sections, setSections] = useState<SectionBlock[]>(
    initial?.section_blocks?.length
      ? initial.section_blocks
      : defaultSections(),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function buildBadges() {
    const badges: { icon: IconOpt; text: string }[] = [];
    if (b1Text.trim()) badges.push({ icon: b1Icon, text: b1Text.trim() });
    if (b2Text.trim()) badges.push({ icon: b2Icon, text: b2Text.trim() });
    return badges;
  }

  function buildSectionBlocksJson() {
    return sections
      .map((s) => ({
        title: s.title.trim(),
        items: s.itemsText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      }))
      .filter((s) => s.title || s.items.length > 0);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const supabase = createClient();
    const badges = buildBadges();

    const base = {
      card_type: cardType,
      title,
      price_label: priceLabel,
      cta_label: ctaLabel,
      badges,
      sort_order: sortOrder,
      published,
    };

    const payloadList =
      cardType === "list"
        ? {
            ...base,
            list_heading: listHeading.trim() || null,
            list_points: listPointsText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            section_blocks: null,
          }
        : {
            ...base,
            list_heading: null,
            list_points: null,
            section_blocks: buildSectionBlocksJson(),
          };

    try {
      if (mode === "create") {
        const { data, error } = await supabase
          .from("home_showcase_cards")
          .insert(payloadList)
          .select("id")
          .single();
        if (error) throw error;
        if (!data) throw new Error("Kayıt oluşturulamadı");
        setMsg("Kart oluşturuldu.");
        router.push(`/admin/vitrin-salon/kartlar/${data.id}`);
        router.refresh();
      } else if (initial) {
        const { error } = await supabase
          .from("home_showcase_cards")
          .update(payloadList)
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

  function addSection() {
    setSections((s) => [...s, { title: "", itemsText: "" }]);
  }

  function removeSection(i: number) {
    setSections((s) => s.filter((_, j) => j !== i));
  }

  function updateSection(i: number, patch: Partial<SectionBlock>) {
    setSections((s) => s.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <label className="block text-sm font-bold">
        Kart tipi
        <select
          value={cardType}
          onChange={(e) => setCardType(e.target.value as "list" | "sections")}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        >
          <option value="list">Liste (program sonuçları vb.)</option>
          <option value="sections">Bölümler (birden fazla başlık + madde)</option>
        </select>
      </label>

      <label className="block text-sm font-bold">
        Başlık
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm font-bold">
        Fiyat metni
        <input
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="5.500 ₺"
        />
      </label>
      <label className="block text-sm font-bold">
        Buton metni
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <fieldset className="space-y-3 rounded-xl border border-black/10 p-4">
        <legend className="px-1 text-sm font-bold">Rozetler</legend>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={b1Icon}
            onChange={(e) => setB1Icon(e.target.value as IconOpt)}
            className="rounded-lg border border-black/10 px-2 py-2 text-sm"
          >
            <option value="play">Oynat</option>
            <option value="lock">Kilit</option>
          </select>
          <input
            value={b1Text}
            onChange={(e) => setB1Text(e.target.value)}
            placeholder="Birinci rozet"
            className="min-w-[12rem] flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={b2Icon}
            onChange={(e) => setB2Icon(e.target.value as IconOpt)}
            className="rounded-lg border border-black/10 px-2 py-2 text-sm"
          >
            <option value="play">Oynat</option>
            <option value="lock">Kilit</option>
          </select>
          <input
            value={b2Text}
            onChange={(e) => setB2Text(e.target.value)}
            placeholder="İkinci rozet (isteğe bağlı)"
            className="min-w-[12rem] flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </fieldset>

      {cardType === "list" ? (
        <>
          <label className="block text-sm font-bold">
            Liste üst başlığı
            <input
              value={listHeading}
              onChange={(e) => setListHeading(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              placeholder="Program sonuçları:"
            />
          </label>
          <label className="block text-sm font-bold">
            Maddeler (her satır bir madde)
            <textarea
              value={listPointsText}
              onChange={(e) => setListPointsText(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
          </label>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Bölümler</p>
            <button
              type="button"
              onClick={addSection}
              className="text-xs font-bold uppercase text-[#6a7a00] hover:underline"
            >
              + Bölüm ekle
            </button>
          </div>
          {sections.map((sec, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-black/10 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-500">
                  Bölüm {i + 1}
                </span>
                {sections.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Kaldır
                  </button>
                ) : null}
              </div>
              <input
                value={sec.title}
                onChange={(e) => updateSection(i, { title: e.target.value })}
                placeholder="Bölüm başlığı"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
              <textarea
                value={sec.itemsText}
                onChange={(e) =>
                  updateSection(i, { itemsText: e.target.value })
                }
                placeholder="Her satır bir madde"
                rows={5}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      )}

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
