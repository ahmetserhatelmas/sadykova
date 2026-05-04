"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublicSiteUrl, site } from "@/lib/site";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const base = getPublicSiteUrl();
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${base}/auth/callback?next=/panel/programlar`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    // Supabase: Bu e-posta zaten kayıtlıysa hata vermeden "sahte" kullanıcı dönebilir;
    // bu durumda onay maili gitmez (e-posta sızdırmama politikası).
    if (data.user?.identities?.length === 0) {
      setError(
        "Bu e-posta ile zaten bir hesap var. Giriş yapın veya şifrenizi sıfırlayın.",
      );
      return;
    }
    if (data.session) {
      router.push("/panel/programlar");
      router.refresh();
      return;
    }
    setSent(true);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F3F5] px-4 py-16">
      <Link href="/" className="mb-10 text-sm font-bold uppercase text-zinc-600 hover:text-black">
        ← {site.brand}
      </Link>
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Kayıt ol
        </h1>
        {sent ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            E-postanıza bir onay linki gönderdik. Gelen kutunuzu kontrol edin;
            ardından giriş yapabilirsiniz.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6">
            <label className="block text-xs font-bold uppercase text-zinc-500">
              Ad soyad
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
              />
            </label>
            <label className="mt-4 block text-xs font-bold uppercase text-zinc-500">
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
              Şifre (en az 6 karakter)
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
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
              {loading ? "Kayıt…" : "Hesap oluştur"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-zinc-600">
          Zaten üye misiniz?{" "}
          <Link href="/giris" className="font-bold text-black underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
