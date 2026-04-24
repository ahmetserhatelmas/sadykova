"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/panel/programlar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F3F5] px-4 py-16">
      <Link href="/" className="mb-10 text-sm font-bold uppercase text-zinc-600 hover:text-black">
        ← {site.brand}
      </Link>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Giriş yap
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Üye paneline erişmek için e-posta ve şifrenizi girin.
        </p>
        <label className="mt-8 block text-xs font-bold uppercase text-zinc-500">
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
        <label className="mt-4 block text-xs font-bold uppercase text-zinc-500">
          Şifre
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Giriş…" : "Giriş yap"}
        </button>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="font-bold text-black underline">
            Kayıt ol
          </Link>
        </p>
      </form>
    </div>
  );
}
