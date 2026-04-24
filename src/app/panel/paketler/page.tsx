import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Lock, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatTier } from "@/lib/membership";
import type { MembershipTier } from "@/types/db";

const packages = [
  {
    tier: "1" as MembershipTier,
    title: "Başlangıç Paketi",
    blurb:
      "0–2 ay düzenli antrenman deneyimi olanlar için: tüm vücut, temel teknik, kısa seanslar.",
    price: "1.990 ₺",
    pills: [
      { icon: "play" as const, text: "Ödeme sonrası hemen başla" },
      { icon: "lock" as const, text: "1 yıl erişim (örnek)" },
    ],
    items: [
      "Tüm vücut çalışması",
      "Temel hareket tekniği",
      "Kademeli yük artışı",
      "12 antrenman × 30–40 dk",
    ],
  },
  {
    tier: "2" as MembershipTier,
    title: "Gelişim Paketi",
    blurb:
      "Orta seviye: 2–6 ay düzenli antrenman veya başlangıç paketinden sonra.",
    price: "2.390 ₺",
    pills: [
      { icon: "play" as const, text: "Hemen başlangıç" },
      { icon: "lock" as const, text: "1 yıl erişim (örnek)" },
    ],
    items: [
      "Güç odaklı tüm vücut",
      "Teknik detay",
      "12 antrenman × 60 dk",
    ],
  },
  {
    tier: "3" as MembershipTier,
    title: "Premium Paketi",
    blurb:
      "İleri seviye: 6+ ay düzenli antrenman; definasyon ve yoğun programlar.",
    price: "2.890 ₺",
    pills: [
      { icon: "play" as const, text: "Dönem başı katılım" },
      { icon: "lock" as const, text: "Süre pakete göre" },
    ],
    items: [
      "İleri düzey planlama",
      "Hedefe özel içerik",
      "Uzun seans seçenekleri",
    ],
  },
];

export default async function PanelPaketlerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/panel/paketler");

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .single();

  const currentTier = (profile?.membership_tier ?? null) as MembershipTier | null;

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Paketler
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
        Size uygun üyelik paketini seçin. Ödeme entegrasyonu eklendiğinde buradan
        satın alabileceksiniz; şimdilik antrenörünüzle iletişime geçerek kayıt
        yaptırabilirsiniz.
      </p>

      {currentTier ? (
        <div className="mt-6 rounded-2xl bg-[#D1FF4E]/30 px-4 py-3 text-sm font-medium text-black ring-1 ring-black/10">
          Mevcut paket etiketiniz:{" "}
          <strong>{formatTier(currentTier)}</strong>. Yükseltme için antrenörünüze
          yazın veya aşağıdaki bilgi talebini kullanın.
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm text-zinc-600 ring-1 ring-black/5">
          Profilinizde henüz bir paket etiketi yok. Antrenörünüz atadığında burada
          görünecek.
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {packages.map((pkg) => (
          <article
            key={pkg.tier}
            className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-white to-[#EEF0F3] p-6 pb-8 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-black uppercase leading-tight text-black">
                {pkg.title}
              </h2>
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-[#D1FF4E] text-center text-[10px] font-black uppercase leading-tight text-black">
                {pkg.tier}
                <span className="font-bold normal-case">seviye</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {pkg.pills.map((p) => (
                <span
                  key={p.text}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-black ring-1 ring-black/5"
                >
                  {p.icon === "play" ? (
                    <Play className="h-3 w-3 fill-black" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {p.text}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">{pkg.blurb}</p>
            <ul className="mt-4 space-y-2">
              {pkg.items.map((it) => (
                <li key={it} className="flex gap-2 text-sm font-medium text-zinc-800">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#b8e034]"
                    strokeWidth={2.5}
                  />
                  {it}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-2xl font-black text-black">{pkg.price}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/iletisim"
                className="inline-flex justify-center rounded-full bg-[#D1FF4E] px-4 py-2.5 text-center text-xs font-black uppercase text-black hover:brightness-95"
              >
                Bilgi & satın alma
              </Link>
              <p className="text-center text-[11px] text-zinc-500">
                Örnek fiyat — antrenörünüz güncel tutarı onaylar
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
