"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** E-posta doğrulama linkinden geldikten sonra ?onay=eposta ile gösterilir. */
export function EmailConfirmedNotice() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("onay") !== "eposta") return;
    setOpen(true);
    params.delete("onay");
    const q = params.toString();
    const path = window.location.pathname;
    router.replace(q ? `${path}?${q}` : path, { scroll: false });
  }, [router]);

  if (!open) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-green-50 px-4 py-4 text-sm text-green-950 ring-1 ring-green-200/90 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-medium" role="status">
        <span className="font-black">E-postanız onaylandı.</span> Hesabınız
        hazır; aşağıdan programlarınıza devam edebilirsiniz.
      </p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="shrink-0 rounded-full bg-green-200/80 px-4 py-2 text-xs font-black uppercase text-green-950 hover:bg-green-200"
      >
        Tamam
      </button>
    </div>
  );
}
