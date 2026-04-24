import type { MembershipTier } from "@/types/db";

export const tierLabels: Record<MembershipTier, string> = {
  "1": "Başlangıç Paketi",
  "2": "Gelişim Paketi",
  "3": "Premium Paketi",
};

export function formatTier(t: MembershipTier | null) {
  if (!t) return "Atanmadı";
  return tierLabels[t];
}
