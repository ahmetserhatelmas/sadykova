"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ContactForm } from "./ContactForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative z-10 w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-xl ring-1 ring-black/10 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="contact-modal-title"
            className="text-lg font-black uppercase tracking-tight text-black"
          >
            İletişime geçin
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-black"
            aria-label="Pencereyi kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Mesajınızı bırakın; en kısa sürede size dönüş yapalım.
        </p>
        <ContactForm
          className="mt-6"
          onSuccess={() => {
            window.setTimeout(() => onClose(), 2200);
          }}
        />
      </div>
    </div>
  );
}
