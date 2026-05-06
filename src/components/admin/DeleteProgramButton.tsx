"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteProgramButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        `“${title}” programını silmek istediğinize emin misiniz? İçerik ve üye erişim kayıtları da silinir (dosyalar depoda kalabilir).`,
      )
    ) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onDelete}
      className="text-xs font-bold uppercase text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Sil"}
    </button>
  );
}
