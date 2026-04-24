"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContactModal } from "./ContactModal";

const btnClass =
  "group inline-flex w-full max-w-md items-center justify-between gap-4 rounded-full bg-[#D1FF4E] py-3 pl-8 pr-2 text-sm font-black uppercase tracking-wide text-black hover:brightness-95 lg:w-auto";

export function ContactFooterCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={btnClass}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        İletişime geçin
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <ArrowUpRight className="h-6 w-6 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
