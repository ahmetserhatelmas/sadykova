/**
 * Supabase Auth kullanıcı şifresini e-posta ile günceller.
 * Gerekli env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env veya .env.local)
 *
 * Kullanım:
 *   node scripts/set-supabase-password.mjs dilarakazdal@gmail.com
 *   (ardından yeni şifre sorulur)
 *
 * veya tek satır (shell geçmişine düşer):
 *   node scripts/set-supabase-password.mjs dilarakazdal@gmail.com 'YeniSifre123!'
 *
 * zsh/bash: şifrede ! varsa mutlaka tek tırnak: 'Rio2026!'  (tırnaksız ! geçmiş genişletmesi bozar)
 */

import {
  adminPutUser,
  getAdminUserByEmail,
  loadEnv,
  printAdminFailure,
} from "./supabase-admin-helper.mjs";

function questionHidden(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(query);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let buf = "";
    const onData = (ch) => {
      const s = String(ch);
      if (s === "\n" || s === "\r" || s === "\u0004") {
        stdin.setRawMode(false);
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(buf);
        return;
      }
      if (s === "\u0003") {
        process.exit(1);
      }
      if (s === "\u007f" || s === "\b") {
        buf = buf.slice(0, -1);
        return;
      }
      buf += s;
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const env = loadEnv();
  const baseUrl = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const emailArg = process.argv[2]?.trim();
  const passwordArg = process.argv[3];

  if (!baseUrl || !serviceRole) {
    console.error(
      "Eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY (.env / .env.local)",
    );
    process.exit(1);
  }
  if (!emailArg) {
    console.error(
      "Kullanım: node scripts/set-supabase-password.mjs e-posta@ornek.com\n" +
        "   veya: node scripts/set-supabase-password.mjs e-posta@ornek.com 'YeniSifre'",
    );
    process.exit(1);
  }

  const email = emailArg.toLowerCase();
  let password = passwordArg;
  if (!password) {
    password = await questionHidden("Yeni şifre: ");
  }
  if (!password || password.length < 6) {
    console.error("Şifre en az 6 karakter olmalı.");
    process.exit(1);
  }

  const user = await getAdminUserByEmail(baseUrl, serviceRole, email);
  if (!user?.id) {
    console.error(`Bu e-posta ile kullanıcı bulunamadı: ${emailArg}`);
    process.exit(1);
  }

  const { res, out } = await adminPutUser(baseUrl, serviceRole, user.id, {
    password,
  });

  if (!res.ok) {
    printAdminFailure(res, out, "Güncelleme başarısız");
    process.exit(1);
  }
  console.log("Tamam. Şifre güncellendi:", out.email ?? emailArg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
