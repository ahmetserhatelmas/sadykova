import { CategoryPills } from "@/components/home/CategoryPills";
import { site } from "@/lib/site";

type Props = {
  featuredTitle?: string;
};

export function HeroSection({
  featuredTitle = "DEFİNASYON — EVDE GÜÇ ANTRENMANI (ÖRNEK TARİH)",
}: Props) {
  return (
    <section className="relative z-10 overflow-x-clip px-4 pb-8 pt-2 sm:px-8 lg:px-12">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 select-none text-center text-[12vw] font-black uppercase leading-none tracking-tighter text-black/[0.06] sm:text-[10vw] lg:text-[8.5rem]"
        aria-hidden
      >
        {site.brand}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="relative z-10 w-full max-w-xl pt-8 text-left lg:pt-16">
          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-black sm:text-4xl lg:text-[2.75rem]">
            {featuredTitle}
          </h1>
        </div>

        <div className="relative z-10 flex w-full flex-1 flex-col items-center lg:items-end">
          <div className="relative isolate mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:mx-0 lg:max-w-[360px]">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-200 to-zinc-300 shadow-inner ring-1 ring-black/5"
              role="img"
              aria-label="Antrenör fotoğrafı — yakında"
            >
              <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Fotoğraf
                <br />
                yakında
              </div>
            </div>

            {/* Mobilde fotoğrafın altında; lg+ sağ üst köşede — marquee ile çakışmaz */}
            <div className="absolute left-1/2 top-[calc(100%+1rem)] z-20 flex h-28 w-28 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-white text-center shadow-lg ring-1 ring-black/5 sm:h-32 sm:w-32 lg:left-auto lg:top-8 lg:-right-2 lg:translate-x-0 lg:ring-black/5">
              <span className="text-2xl font-black leading-none text-black">
                33.000+
              </span>
              <span className="mt-1 max-w-[5.5rem] text-[9px] font-bold uppercase leading-tight text-zinc-600">
                programlarımı tamamlayan kişi
              </span>
            </div>
          </div>
          {/* Rozet lg’de mutlak olduğu için alta boşluk */}
          <div className="h-36 w-full shrink-0 lg:hidden" aria-hidden />
        </div>
      </div>

      <div className="relative z-0 mt-8 w-full sm:mt-10">
        <CategoryPills />
      </div>
    </section>
  );
}
