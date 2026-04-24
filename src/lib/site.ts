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
