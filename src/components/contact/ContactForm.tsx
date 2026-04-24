"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";

type Props = {
  onSuccess?: () => void;
  className?: string;
};

export function ContactForm({ onSuccess, className = "" }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!kvkk) {
      setErr("Devam etmek için aydınlatma metnini onaylayın.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: fullName.trim(),
      email: email.trim(),
      message: message.trim(),
      kvkk_accepted: true,
    });
    setLoading(false);
    if (error) {
      setErr(
        error.message.includes("relation")
          ? "Form geçici olarak kullanılamıyor. Lütfen daha sonra deneyin."
          : error.message,
      );
      return;
    }
    setDone(true);
    setFullName("");
    setEmail("");
    setMessage("");
    setKvkk(false);
    onSuccess?.();
  }

  if (done) {
    return (
      <div
        className={`rounded-2xl bg-[#D1FF4E]/40 px-6 py-8 text-center ring-1 ring-black/10 ${className}`}
      >
        <p className="font-bold text-black">Mesajınız alındı</p>
        <p className="mt-2 text-sm text-zinc-700">
          En kısa sürede size dönüş yapılacaktır.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
    >
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500">
          Ad soyad
        </label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          placeholder="Adınız ve soyadınız"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500">
          E-posta
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          placeholder="ornek@eposta.com"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500">
          Mesajınız
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          placeholder="Nasıl yardımcı olabiliriz?"
        />
      </div>
      <label className="flex cursor-pointer gap-3 text-sm leading-snug text-zinc-700">
        <input
          type="checkbox"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 accent-black"
        />
        <span>
          Talebimle ilgili kişisel verilerimin işlenmesine,{" "}
          <Link
            href="/gizlilik"
            className="font-semibold text-black underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            gizlilik politikası
          </Link>
          nda açıklandığı şekilde izin veriyorum.
        </span>
      </label>
      {err ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {err}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#2d5a45] py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Gönderiliyor…" : "Gönder"}
      </button>
      <p className="text-center text-[11px] text-zinc-500">
        {site.brand} — iletişim formu
      </p>
    </form>
  );
}
