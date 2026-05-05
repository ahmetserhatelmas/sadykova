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
  const passwordResetOk = searchParams.get("sifre") === "yenilendi";
  const emailNotConfirmed =
    searchParams.get("hata") === "eposta-onayi";
  const oauthCallbackFailed = searchParams.get("hata") === "oauth";
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
    if (signError) {
      setLoading(false);
      setError(signError.message);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && !user.email_confirmed_at) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(
        "E-postanızı henüz onaylamadınız. Kayıt e-postasındaki doğrulama bağlantısına tıklayın (spam klasörüne de bakın).",
      );
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
        aria-busy={loading}
        className={`relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5 ${loading ? "cursor-wait" : ""}`}
      >
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Giriş yap
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Üye paneline erişmek için e-posta ve şifrenizi girin.
        </p>
        {passwordResetOk ? (
          <p
            className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-200/80"
            role="status"
          >
            Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
          </p>
        ) : null}
        {emailNotConfirmed ? (
          <p
            className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 ring-1 ring-amber-200/90"
            role="alert"
          >
            Üye alanına girmek için önce e-postanızı doğrulamanız gerekir. Gelen
            kutunuzdaki bağlantıya tıklayın.
          </p>
        ) : null}
        {oauthCallbackFailed ? (
          <p
            className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 ring-1 ring-amber-200/90"
            role="alert"
          >
            Doğrulama bağlantısı işe yaramadı (süresi dolmuş veya zaten
            kullanılmış olabilir). Yeni onay e-postası için{" "}
            <Link href="/kayit" className="font-black underline">
              kayıt
            </Link>{" "}
            sayfasını kullanın veya şifrenizle giriş yapın.
          </p>
        ) : null}
        <label className="mt-8 block text-xs font-bold uppercase text-zinc-500">
          E-posta
          <input
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E] disabled:cursor-wait disabled:opacity-60"
          />
        </label>
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <label className="block text-xs font-bold uppercase text-zinc-500">
              Şifre
            </label>
            <Link
              href="/giris/sifremi-unuttum"
              tabIndex={loading ? -1 : undefined}
              className={`text-xs font-bold text-zinc-600 underline hover:text-black ${loading ? "pointer-events-none opacity-40" : ""}`}
            >
              Şifremi unuttum
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E] disabled:cursor-wait disabled:opacity-60"
          />
        </div>
        {error ? (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#D1FF4E] px-4 py-3 text-sm font-black uppercase text-black hover:brightness-95 disabled:opacity-90"
        >
          {loading ? (
            <>
              <span
                className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-black/20 border-t-black"
                aria-hidden
              />
              <span>Giriş yapılıyor…</span>
            </>
          ) : (
            "Giriş yap"
          )}
        </button>
        {loading ? (
          <p className="mt-3 text-center text-xs font-medium text-zinc-500" role="status">
            Hesabınız doğrulanıyor, birkaç saniye sürebilir.
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm text-zinc-600">
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            tabIndex={loading ? -1 : undefined}
            className={`font-bold text-black underline ${loading ? "pointer-events-none opacity-40" : ""}`}
          >
            Kayıt ol
          </Link>
        </p>
      </form>
    </div>
  );
}
