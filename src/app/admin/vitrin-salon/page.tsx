import Link from "next/link";

export default function AdminVitrinSalonPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">
        Salon / okul vitrini
      </h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Ana sayfadaki yeşil etiket şeridi ve iki büyük kart (okul + spor salonu).
        Migration:{" "}
        <code className="rounded bg-zinc-200 px-1">005_home_showcase.sql</code>
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/vitrin-salon/etiketler"
          className="rounded-2xl bg-[#D1FF4E] p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:brightness-95"
        >
          Üst etiketler
        </Link>
        <Link
          href="/admin/vitrin-salon/kartlar"
          className="rounded-2xl bg-white p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:bg-zinc-50"
        >
          Vitrin kartları
        </Link>
      </div>
    </div>
  );
}
