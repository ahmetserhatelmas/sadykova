import Link from "next/link";
import { ShowcaseCardForm } from "@/components/admin/ShowcaseCardForm";

export default function AdminShowcaseCardYeniPage() {
  return (
    <div>
      <Link
        href="/admin/vitrin-salon/kartlar"
        className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
      >
        ← Kartlar
      </Link>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Yeni vitrin kartı
      </h1>
      <div className="mt-8">
        <ShowcaseCardForm mode="create" />
      </div>
    </div>
  );
}
