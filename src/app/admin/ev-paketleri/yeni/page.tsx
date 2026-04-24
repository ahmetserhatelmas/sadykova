import Link from "next/link";
import { HomePackageForm } from "@/components/admin/HomePackageForm";

export default function AdminEvPaketYeniPage() {
  return (
    <div>
      <Link
        href="/admin/ev-paketleri"
        className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
      >
        ← Ev paketleri
      </Link>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Yeni ev paketi
      </h1>
      <div className="mt-8">
        <HomePackageForm mode="create" />
      </div>
    </div>
  );
}
