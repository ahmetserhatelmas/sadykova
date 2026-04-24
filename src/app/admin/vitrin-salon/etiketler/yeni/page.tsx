import Link from "next/link";
import { ShowcasePillForm } from "@/components/admin/ShowcasePillForm";

export default function AdminShowcasePillYeniPage() {
  return (
    <div>
      <Link
        href="/admin/vitrin-salon/etiketler"
        className="text-xs font-bold uppercase text-zinc-500 hover:text-black"
      >
        ← Etiketler
      </Link>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">
        Yeni etiket
      </h1>
      <div className="mt-8">
        <ShowcasePillForm mode="create" />
      </div>
    </div>
  );
}
