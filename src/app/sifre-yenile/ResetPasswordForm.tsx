"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setHasSession(!!data.session);
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: upErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await supabase.auth.signOut();
    router.push("/giris?sifre=yenilendi");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F3F5] text-sm text-zinc-500">
        Yükleniyor…
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F3F5] px-4 py-16">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-black uppercase tracking-tight text-black">
            Bağlantı geçersiz
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Bu sayfaya yalnızca e-postadaki şifre sıfırlama bağlantısı ile
            erişilebilir. Bağlantının süresi dolmuş olabilir.
          </p>
          <Link
            href="/giris/sifremi-unuttum"
            className="mt-8 inline-block rounded-full bg-[#D1FF4E] px-6 py-3 text-sm font-black uppercase text-black hover:brightness-95"
          >
            Yeni bağlantı iste
          </Link>
          <p className="mt-6 text-center text-sm text-zinc-600">
            <Link href="/giris" className="font-bold text-black underline">
              Girişe dön
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F3F5] px-4 py-16">
      <Link
        href="/"
        className="mb-10 text-sm font-bold uppercase text-zinc-600 hover:text-black"
      >
        ← {site.brand}
      </Link>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Yeni şifre
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Hesabınız için yeni bir şifre belirleyin.
        </p>
        <label className="mt-8 block text-xs font-bold uppercase text-zinc-500">
          Yeni şifre
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase text-zinc-500">
          Yeni şifre tekrar
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          />
        </label>
        {error ? (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-full bg-[#D1FF4E] py-3 text-sm font-black uppercase text-black hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor…" : "Şifreyi güncelle"}
        </button>
      </form>
    </div>
  );
}
