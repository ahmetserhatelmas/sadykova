import { CheckCircle2, Lock, Play } from "lucide-react";
import { publicStorageUrl } from "@/lib/site";
import type { HomePackageRow } from "./homePackageRow";

export function HomePackageCard({ pkg }: { pkg: HomePackageRow }) {
  const cover = publicStorageUrl(pkg.cover_image_path);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-white to-[#EEF0F3] p-6 pb-8 shadow-sm ring-1 ring-black/5 md:pb-48">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-black uppercase leading-tight text-black">
          {pkg.title}
        </h3>
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-[#D1FF4E] text-center text-[9px] font-black uppercase leading-tight text-black">
          {pkg.level_display}
          <span className="font-bold">seviye</span>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-black ring-1 ring-black/5">
          <Play className="h-3 w-3 fill-black" />
          {pkg.pill_start}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-black ring-1 ring-black/5">
          <Lock className="h-3 w-3" />
          {pkg.pill_access}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">{pkg.blurb}</p>
      <ul className="mt-4 space-y-2">
        {pkg.features.map((it) => (
          <li key={it} className="flex gap-2 text-sm font-medium text-zinc-800">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-[#b8e034]"
              strokeWidth={2.5}
            />
            {it}
          </li>
        ))}
      </ul>
      <span className="relative z-10 mt-6 text-2xl font-black text-black">
        {pkg.price_label}
      </span>
      {cover ? (
        <div className="pointer-events-none absolute bottom-0 right-0 hidden h-44 w-36 overflow-hidden rounded-tl-3xl md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-44 w-36 rounded-tl-3xl bg-zinc-300/60 md:block" />
          <div className="pointer-events-none absolute bottom-2 right-4 hidden h-40 w-28 rounded-xl bg-zinc-400/35 md:block" />
        </>
      )}
    </article>
  );
}
