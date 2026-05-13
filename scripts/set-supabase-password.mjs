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

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {Response} res */
async function readJsonBody(res) {
  const raw = await res.text();
  if (!raw || !raw.trim()) return { _empty: true, _raw: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { _parseError: true, _raw: raw.slice(0, 2000) };
  }
}

function formatApiError(out) {
  if (!out || typeof out !== "object") return String(out);
  return (
    out.msg ??
    out.message ??
    out.error_description ??
    out.error?.message ??
    (out.weak_password?.reasons?.length
      ? `Zayıf şifre: ${out.weak_password.reasons.join("; ")}`
      : null) ??
    (Object.keys(out).length === 0 ? null : JSON.stringify(out))
  );
}

function loadEnv() {
  const root = path.join(__dirname, "..");
  const merged = {};
  for (const name of [".env", ".env.local"]) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      merged[key] = val;
    }
  }
  return merged;
}

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

async function listAllUsers(baseUrl, serviceRole) {
  const users = [];
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const url = `${baseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
    });
    const body = await readJsonBody(res);
    if (!res.ok) {
      const detail = formatApiError(body) ?? body?._raw ?? res.statusText;
      throw new Error(`Kullanıcı listesi (${res.status}): ${detail}`);
    }
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return users;
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

  const users = await listAllUsers(baseUrl, serviceRole);
  const user = users.find((u) => (u.email ?? "").toLowerCase() === email);
  if (!user?.id) {
    console.error(`Bu e-posta ile kullanıcı bulunamadı: ${emailArg}`);
    process.exit(1);
  }

  const patchUrl = `${baseUrl}/auth/v1/admin/users/${user.id}`;
  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  const out = await readJsonBody(res);
  if (!res.ok) {
    const detail =
      formatApiError(out) ??
      (out._raw ? `Ham yanıt: ${out._raw}` : null) ??
      (out._empty ? "(yanıt gövdesi boş)" : JSON.stringify(out));
    console.error(`Güncelleme başarısız (HTTP ${res.status}):`, detail);
    process.exit(1);
  }
  console.log("Tamam. Şifre güncellendi:", out.email ?? emailArg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
