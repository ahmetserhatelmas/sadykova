/**
 * Supabase Auth: e-postayı yönetici olarak doğrular (email_confirmed_at).
 * Gerekli env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Kullanım:
 *   node scripts/confirm-supabase-email.mjs dilarakazdal@gmail.com
 */

import {
  adminPutUser,
  getAdminUserByEmail,
  loadEnv,
  printAdminFailure,
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
      "Kullanım: node scripts/confirm-supabase-email.mjs e-posta@ornek.com",
    );
    process.exit(1);
  }

  const user = await getAdminUserByEmail(baseUrl, serviceRole, emailArg);
  if (!user?.id) {
    console.error(`Bu e-posta ile kullanıcı bulunamadı: ${emailArg}`);
    process.exit(1);
  }

  if (user.email_confirmed_at) {
    console.log("Zaten doğrulanmış:", emailArg, user.email_confirmed_at);
    process.exit(0);
  }

  const { res, out } = await adminPutUser(baseUrl, serviceRole, user.id, {
    email_confirm: true,
  });

  if (!res.ok) {
    printAdminFailure(res, out, "E-posta doğrulama başarısız");
    process.exit(1);
  }

  console.log("Tamam. E-posta doğrulandı:", out.email ?? emailArg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
