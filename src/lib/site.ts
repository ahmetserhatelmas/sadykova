function trimTrailingSlashes(url: string) {
  return url.replace(/\/+$/, "");
}

/**
 * Auth `redirectTo` / `emailRedirectTo` tabanı.
 * Tarayıcıda **her zaman** `window.location.origin` kullanılır; böylece
 * `.env` içinde localhost kalsa bile sadykova.vercel.app üzerinden kayıt
 * olunca e-postadaki link üretim adresine gider.
 * Sunucuda (window yok) `NEXT_PUBLIC_SITE_URL` kullanılır.
 */
export function getPublicSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
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
