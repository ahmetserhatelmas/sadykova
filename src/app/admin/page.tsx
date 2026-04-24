import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">Özet</h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Program oluşturun, kapak ve videoları depolama alanına yükleyin, ardından
        hangi üyenin hangi programı göreceğini atayın.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Link
          href="/admin/programlar"
          className="rounded-2xl bg-[#D1FF4E] p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:brightness-95"
        >
          Programlar
        </Link>
        <Link
          href="/admin/uyeler"
          className="rounded-2xl bg-white p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:bg-zinc-50"
        >
          Üyeler ve erişim
        </Link>
        <Link
          href="/admin/ev-paketleri"
          className="rounded-2xl bg-white p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:bg-zinc-50"
        >
          Ev paketleri
        </Link>
        <Link
          href="/admin/vitrin-salon"
          className="rounded-2xl bg-white p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:bg-zinc-50"
        >
          Salon vitrini
        </Link>
        <Link
          href="/admin/mesajlar"
          className="rounded-2xl bg-white p-6 font-black uppercase shadow-sm ring-1 ring-black/5 hover:bg-zinc-50"
        >
          Mesajlar
        </Link>
      </div>
    </div>
  );
}
