"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPasswordResetEmailError } from "@/lib/auth-errors";
import { getPublicSiteUrl, site } from "@/lib/site";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const base = getPublicSiteUrl();
    if (!base) {
      setError("Site adresi yapılandırılamadı. Sayfayı yenileyip tekrar deneyin.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${base}/auth/callback?next=${encodeURIComponent("/sifre-yenile")}`,
      },
    );
    setLoading(false);
    if (resetError) {
      setError(formatPasswordResetEmailError(resetError.message));
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F3F5] px-4 py-16">
      <Link
        href="/giris"
        className="mb-10 text-sm font-bold uppercase text-zinc-600 hover:text-black"
      >
        ← Girişe dön
      </Link>
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Şifre sıfırlama
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          E-posta adresinize yeni şifre belirlemeniz için bir bağlantı göndereceğiz.
        </p>
        {sent ? (
          <p className="mt-8 text-sm font-medium text-green-800" role="status">
            E-postanızı kontrol edin. Bağlantı birkaç dakika içinde gelmezse spam
            klasörüne bakın.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <label className="block text-xs font-bold uppercase text-zinc-500">
              E-posta
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
              />
            </label>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#D1FF4E] py-3 text-sm font-black uppercase text-black hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Gönderiliyor…" : "Bağlantı gönder"}
            </button>
          </form>
        )}
        <p className="mt-8 text-center text-sm text-zinc-600">
          <Link href="/" className="font-bold text-black underline">
            {site.brand} ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
