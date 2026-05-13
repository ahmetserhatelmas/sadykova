/**
 * public.profiles.role alanını 'admin' yapar (auth kullanıcı id = profile id).
 * Gerekli env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Kullanım:
 *   node scripts/set-supabase-admin.mjs dilarakazdal@gmail.com
 */

import {
  getAdminUserByEmail,
  loadEnv,
  readJsonBody,
  formatApiError,
} from "./supabase-admin-helper.mjs";

async function main() {
  const env = loadEnv();
  const baseUrl = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const emailArg = process.argv[2]?.trim();

  if (!baseUrl || !serviceRole) {
    console.error(
      "Eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY (.env / .env.local)",
    );
    process.exit(1);
  }
  if (!emailArg) {
    console.error(
      "Kullanım: node scripts/set-supabase-admin.mjs e-posta@ornek.com",
    );
    process.exit(1);
  }

  const authUser = await getAdminUserByEmail(baseUrl, serviceRole, emailArg);
  if (!authUser?.id) {
    console.error(`Auth’da bu e-posta yok: ${emailArg}`);
    process.exit(1);
  }

  const url = `${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(authUser.id)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ role: "admin" }),
  });

  const out = await readJsonBody(res);
  if (!res.ok) {
    console.error(
      "Güncelleme başarısız (HTTP " + res.status + "):",
      formatApiError(out) ?? JSON.stringify(out),
    );
    process.exit(1);
  }

  if (!Array.isArray(out) || out.length === 0) {
    console.error(
      "profiles satırı bulunamadı (0 güncelleme). Kullanıcı kayıtlı ama profil tetiklenmemiş olabilir; SQL ile kontrol edin.",
    );
    process.exit(1);
  }

  console.log("Tamam. Admin rolü atandı:", out[0].email ?? emailArg);
  console.log("Çıkış yapıp tekrar giriş yapın; /admin adresini kullanın.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
