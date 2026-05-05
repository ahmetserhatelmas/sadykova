import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/** Onaysız oturumu kapatıp girişe yönlendirir (panel / admin koruması). */
export async function redirectIfEmailUnconfirmed(
  supabase: SupabaseClient,
  user: User,
  nextPath: string,
) {
  if (user.email_confirmed_at) return;
  await supabase.auth.signOut();
  redirect(
    `/giris?hata=eposta-onayi&next=${encodeURIComponent(nextPath)}`,
  );
}
