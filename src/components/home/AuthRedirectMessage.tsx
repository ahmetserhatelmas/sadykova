"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = { tone: "error" | "success"; text: string } | null;

function parseMergedParams(): URLSearchParams {
  const url = new URL(window.location.href);
  const merged = new URLSearchParams(url.searchParams);
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (hash) {
    const fromHash = new URLSearchParams(hash);
    fromHash.forEach((v, k) => merged.set(k, v));
  }
  return merged;
}

function stripAuthNoiseFromUrl() {
  const url = new URL(window.location.href);
  const keys = [
    "error",
    "error_code",
    "error_description",
    "onay",
  ];
  keys.forEach((k) => url.searchParams.delete(k));
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (hash) {
    const hp = new URLSearchParams(hash);
    keys.forEach((k) => hp.delete(k));
    const rest = hp.toString();
    url.hash = rest ? `#${rest}` : "";
  }
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export function AuthRedirectMessage() {
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    const p = parseMergedParams();

    if (p.get("onay") === "eposta") {
      setBanner({
        tone: "success",
        text: "E-postanız onaylandı. Giriş yaparak devam edebilirsiniz.",
      });
      stripAuthNoiseFromUrl();
      return;
    }

    const code = p.get("error_code")?.toLowerCase();
    const desc = (p.get("error_description") ?? "").toLowerCase();
    const err = p.get("error")?.toLowerCase();

    if (
      code === "otp_expired" ||
      desc.includes("expired") ||
      desc.includes("invalid")
    ) {
      setBanner({
        tone: "error",
        text: "Onay bağlantısının süresi dolmuş veya geçersiz. Yeni bir doğrulama e-postası almak için tekrar kayıt olmayı deneyin (aynı adresle) veya giriş yapmayı deneyin.",
      });
      stripAuthNoiseFromUrl();
      return;
    }

    if (err === "access_denied") {
      setBanner({
        tone: "error",
        text: "E-posta doğrulaması tamamlanamadı. Bağlantıyı yeniden isteyin veya giriş sayfasından şifrenizle deneyin.",
      });
      stripAuthNoiseFromUrl();
      return;
    }
  }, []);

  if (!banner) return null;

  const box =
    banner.tone === "success"
      ? "bg-green-50 text-green-950 ring-green-200/90"
      : "bg-amber-50 text-amber-950 ring-amber-200/90";

  return (
    <div
      className={`mx-auto max-w-6xl px-4 pb-4 pt-4 sm:px-8 lg:px-12 ${banner.tone === "error" ? "[&_a]:text-amber-900 [&_a]:underline" : ""}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 text-sm font-medium ring-1 ${box}`}
        role={banner.tone === "error" ? "alert" : "status"}
      >
        <p>{banner.text}</p>
        <p className="mt-3 flex flex-wrap gap-4 text-xs font-bold uppercase">
          <Link href="/giris" className="hover:opacity-80">
            Giriş yap
          </Link>
          <Link href="/kayit" className="hover:opacity-80">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
