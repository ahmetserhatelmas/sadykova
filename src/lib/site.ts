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
 * 1) `NEXT_PUBLIC_SITE_URL` canlı adres ise o kullanılır.
 * 2) `NODE_ENV=production` iken tarayıcı localhost’taysa (prod build’i local çalıştırma vb.)
 *    veya origin yoksa → `NEXT_PUBLIC_APP_CANONICAL_URL` veya sadykova.vercel.app.
 * 3) Geliştirme (`next dev`) → her zaman `window.location.origin` (genelde localhost).
 */
const CANONICAL_PRODUCTION_ORIGIN =
  process.env.NEXT_PUBLIC_APP_CANONICAL_URL?.trim() ||
  "https://sadykova.vercel.app";

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !isLocalhostUrl(fromEnv)) {
    return trimTrailingSlashes(fromEnv);
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : null;

  if (process.env.NODE_ENV === "production") {
    if (origin && !isLocalhostUrl(origin)) {
      return origin;
    }
    return trimTrailingSlashes(CANONICAL_PRODUCTION_ORIGIN);
  }

  if (origin) return origin;
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
