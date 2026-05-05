function trimTrailingSlashes(url: string) {
  return url.replace(/\/+$/, "");
}

function isLocalhostUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

/**
 * Auth `redirectTo` / `emailRedirectTo` tabanı.
 * - Vercel’de `NEXT_PUBLIC_SITE_URL=https://sadykova.vercel.app` ise (localhost değilse)
 *   **her zaman** bu adres kullanılır; böylece maildeki link asla yanlışlıkla localhost olmaz.
 * - `.env` localhost ise veya env yoksa tarayıcıda `window.location.origin` kullanılır.
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !isLocalhostUrl(fromEnv)) {
    return trimTrailingSlashes(fromEnv);
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (fromEnv) return trimTrailingSlashes(fromEnv);
  return "";
}

export const site = {
  brand: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Sadykova",
  /** Footer “İletişime geçin” için; .env içinde NEXT_PUBLIC_CONTACT_EMAIL */
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined,
  accent: "#D1FF4E",
  surface: "#F1F3F5",
  card: "#F8F9FA",
} as const;

export function publicStorageUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/program-media/${path}`;
}
