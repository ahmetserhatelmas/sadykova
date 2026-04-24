const pills = [
  "Definasyon",
  "Yeni başlayanlar ve deneyimliler",
  "Kilo verme / kütle",
  "Güç",
  "Ev ve salon",
  "Yeni başlayanlar",
  "Kütle kazanımı",
] as const;

function MarqueeTrack({ items }: { items: readonly string[] }) {
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        className="flex w-max flex-nowrap gap-2 animate-marquee"
        aria-hidden
      >
        {loop.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="shrink-0 whitespace-nowrap rounded-full bg-[#D1FF4E] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-black shadow-sm"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryPills() {
  return (
    <div className="w-full min-w-0">
      <p className="sr-only">
        Kategoriler: {[...pills].join(", ")}
      </p>
      <MarqueeTrack items={pills} />
    </div>
  );
}
