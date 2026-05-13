import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {Response} res
 */
export async function readJsonBody(res) {
  const raw = await res.text();
  if (!raw || !raw.trim()) return { _empty: true, _raw: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { _parseError: true, _raw: raw.slice(0, 2000) };
  }
}

export function formatApiError(out) {
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

export function loadEnv() {
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

export async function listAllUsers(baseUrl, serviceRole) {
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

/**
 * @param {string} baseUrl
 * @param {string} serviceRole
 * @param {string} email
 */
export async function getAdminUserByEmail(baseUrl, serviceRole, email) {
  const users = await listAllUsers(baseUrl, serviceRole);
  const e = email.toLowerCase();
  return users.find((u) => (u.email ?? "").toLowerCase() === e) ?? null;
}

/** GoTrue Admin: PUT /auth/v1/admin/users/:id */
export async function adminPutUser(baseUrl, serviceRole, userId, payload) {
  const res = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const out = await readJsonBody(res);
  return { res, out };
}

export function printAdminFailure(res, out, label) {
  const allow = res.headers.get("Allow");
  const detail =
    formatApiError(out) ??
    (out._raw ? `Ham yanıt: ${out._raw}` : null) ??
    (out._empty ? "(yanıt gövdesi boş)" : JSON.stringify(out));
  console.error(`${label} (HTTP ${res.status}):`, detail);
  if (allow) console.error("Sunucunun izin verdiği yöntemler:", allow);
}
