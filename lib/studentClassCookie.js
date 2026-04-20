export const STUDENT_CLASS_COOKIE = "student_class_member";

function timingSafeEqualHex(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    a.length !== b.length
  ) {
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

/**
 * Cookie chứa email học viên đã xác thực (kèm hạn + chữ ký).
 * Dùng cùng secret với phiên học viên.
 */
export async function createStudentClassCookieValue(secret, email) {
  const maxAgeSec = 60 * 60 * 24 * 14;
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const em = String(email).trim().toLowerCase();
  const msg = `class:${em}:${exp}`;
  const sig = await hmacSha256Hex(secret, msg);
  const payload = Buffer.from(em, "utf8").toString("base64url");
  return { value: `${exp}.${payload}.${sig}`, maxAgeSec };
}

/** @returns {Promise<string | null>} email đã chuẩn hóa */
export async function verifyStudentClassCookie(secret, cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return null;
  const expStr = parts[0];
  const payload = parts[1];
  const sig = parts[2];
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000))
    return null;
  let email;
  try {
    email = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!email || !email.includes("@")) return null;
  const msg = `class:${email}:${exp}`;
  const expected = await hmacSha256Hex(secret, msg);
  if (!timingSafeEqualHex(sig, expected)) return null;
  return email.trim().toLowerCase();
}

export function getDefaultStudentClassCookieOptions(maxAgeSec) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function clearStudentClassCookieOnResponse(res) {
  res.cookies.set(STUDENT_CLASS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
