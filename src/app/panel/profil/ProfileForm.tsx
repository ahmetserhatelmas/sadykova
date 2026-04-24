"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string | undefined;
  initialName: string;
};

export function ProfileForm({ userId, email, initialName }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const supabase = createClient();

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", userId);

    if (pErr) {
      setErr(pErr.message);
      setLoading(false);
      return;
    }

    if (password || password2) {
      if (password.length < 6) {
        setErr("Yeni şifre en az 6 karakter olmalı.");
        setLoading(false);
        return;
      }
      if (password !== password2) {
        setErr("Şifreler eşleşmiyor.");
        setLoading(false);
        return;
      }
      const { error: aErr } = await supabase.auth.updateUser({
        password,
      });
      if (aErr) {
        setErr(aErr.message);
        setLoading(false);
        return;
      }
      setPassword("");
      setPassword2("");
    }

    setMsg("Profil güncellendi.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={saveProfile}
      className="mt-8 max-w-lg space-y-5 rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <label className="block text-xs font-bold uppercase text-zinc-500">
        Ad soyad
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#D1FF4E]"
        />
      </label>
      <div>
        <p className="text-xs font-bold uppercase text-zinc-500">E-posta</p>
        <p className="mt-2 rounded-xl border border-black/5 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          {email ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          E-posta değişikliği için güvenlik nedeniyle destek ile iletişime geçin.
        </p>
      </div>
      <div className="border-t border-black/5 pt-5">
        <p className="text-xs font-bold uppercase text-zinc-500">
          Şifre değiştir (isteğe bağlı)
        </p>
        <label className="mt-3 block text-xs font-medium text-zinc-600">
          Yeni şifre
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-zinc-600">
          Yeni şifre tekrar
          <input
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D1FF4E]"
          />
        </label>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#D1FF4E] px-6 py-2.5 text-xs font-black uppercase text-black hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
