import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "tienghancohue-admin-dev-secret";
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "0000",
  };
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** @param {string} secret */
export async function createAdminCookieValue(secret) {
  const maxAgeSec = 60 * 60 * 24 * 7;
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const msg = `admin:${exp}`;
  const sig = await hmacSha256Hex(secret, msg);
  return { value: `${exp}.${sig}`, maxAgeSec };
}

/** @param {string} secret @param {string | undefined} cookieValue */
export async function verifyAdminCookieValue(secret, cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return false;
  const dot = cookieValue.indexOf(".");
  if (dot < 1) return false;
  const expStr = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const msg = `admin:${exp}`;
  const expected = await hmacSha256Hex(secret, msg);
  return timingSafeEqualHex(sig, expected);
}

/** @param {import("next/server").NextRequest} request */
export async function requireAdmin(request) {
  const secret = getAdminSessionSecret();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminCookieValue(secret, token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
