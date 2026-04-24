"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteHomePackageButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        "Bu paketi silmek istediğinize emin misiniz? Ana sayfadan kalkar.",
      )
    ) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("home_packages").delete().eq("id", id);
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/admin/ev-paketleri");
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onDelete}
      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-black uppercase text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "…" : "Sil"}
    </button>
  );
}
