import { createClient } from "@/lib/supabase/server";
import { parseHomePackageFeatures } from "@/lib/home-package-features";
import { HomePackageCard } from "./HomePackageCard";
import type { HomePackageRow } from "./homePackageRow";

export type { HomePackageRow };

export async function HomePackages() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("home_packages")
    .select(
      "id,title,level_display,pill_start,pill_access,blurb,features,price_label,cover_image_path",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const packages: HomePackageRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    level_display: r.level_display,
    pill_start: r.pill_start,
    pill_access: r.pill_access,
    blurb: r.blurb,
    features: parseHomePackageFeatures(r.features),
    price_label: r.price_label,
    cover_image_path: r.cover_image_path,
  }));

  if (error && packages.length === 0) {
    return (
      <section id="ev" className="bg-[#F1F3F5] px-4 py-16 sm:px-8 lg:px-12">
        <h2 className="mx-auto max-w-6xl text-center text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
          Ev antrenman programları
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-zinc-600">
          Paketler yüklenemedi. Supabase&apos;de{" "}
          <code className="rounded bg-zinc-200 px-1">home_packages</code> tablosu ve
          migration&apos;ın çalıştığından emin olun.
        </p>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section id="ev" className="bg-[#F1F3F5] px-4 py-16 sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-6xl text-center text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Ev antrenman programları
      </h2>
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <HomePackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
