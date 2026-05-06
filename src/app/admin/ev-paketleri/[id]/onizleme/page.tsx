import Link from "next/link";
import { notFound } from "next/navigation";
import { HomePackageCard } from "@/components/home/HomePackageCard";
import type { HomePackageRow } from "@/components/home/homePackageRow";
import { parseHomePackageFeatures } from "@/lib/home-package-features";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function AdminHomePackagePreviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_packages")
    .select(
      "id,title,level_display,pill_start,pill_access,blurb,features,price_label,cover_image_path,published",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const pkg: HomePackageRow = {
    id: row.id,
    title: row.title,
    level_display: row.level_display,
    pill_start: row.pill_start,
    pill_access: row.pill_access,
    blurb: row.blurb,
    features: parseHomePackageFeatures(row.features),
    price_label: row.price_label,
    cover_image_path: row.cover_image_path,
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/ev-paketleri/${id}`}
            className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
          >
            ← Düzenlemeye dön
          </Link>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">
            Vitrin önizlemesi
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Ana sayfadaki üçlü kartlardan birinin birebir düzeni (masaüstünde kapak
            sağ altta). Yayında olmayan paketleri de burada görebilirsiniz.
          </p>
        </div>
        <Link
          href="/#ev"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-50"
        >
          Canlı site — #ev
        </Link>
      </div>

      {!row.published ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Bu paket taslak; ana sayfada yalnızca yayına alınanlar listelenir.
        </p>
      ) : null}

      <section className="mt-10 bg-[#F1F3F5] px-4 py-16 sm:px-8 sm:py-12">
        <h2 className="mx-auto max-w-6xl text-center text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
          Ev antrenman programları
        </h2>
        <div className="mx-auto mt-10 max-w-md md:max-w-6xl md:grid md:grid-cols-3 md:justify-items-center">
          <div className="md:col-start-2">
            <HomePackageCard pkg={pkg} />
          </div>
        </div>
      </section>
    </div>
  );
}
