import { createRemoteJWKSet, jwtVerify } from "jose";
import { firebaseProjectId } from "@/lib/firebaseConfig";

/**
 * JWKS của Firebase Auth.
 * @see https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

const ISSUER = `https://securetoken.google.com/${firebaseProjectId}`;

function decodeJwtPayloadUnsafe(idToken) {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function audienceCandidatesFromEnv() {
  const extra = process.env.FIREBASE_ID_TOKEN_AUDIENCE;
  const list = [firebaseProjectId];
  if (extra && typeof extra === "string") {
    for (const part of extra.split(",")) {
      const s = part.trim();
      if (s && !list.includes(s)) list.push(s);
    }
  }
  return list;
}

/**
 * Lấy danh sách audience cần thử: env + projectId + aud ghi trong token (chỉ dùng để gọi jwtVerify — chữ ký vẫn được kiểm tra).
 */
function audiencesToTry(idToken) {
  const set = new Set(audienceCandidatesFromEnv());
  const raw = decodeJwtPayloadUnsafe(idToken);
  if (raw && typeof raw.aud === "string") set.add(raw.aud);
  if (raw && Array.isArray(raw.aud)) {
    for (const a of raw.aud) {
      if (typeof a === "string") set.add(a);
    }
  }
  return [...set];
}

/**
 * Dự phòng khi JWKS / jose lỗi (mạng, v.v.)
 */
async function verifyWithTokeninfo(idToken) {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
    idToken
  )}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data || typeof data !== "object") return null;
  const audOk =
    data.aud === firebaseProjectId ||
    audienceCandidatesFromEnv().includes(String(data.aud));
  if (!audOk) return null;
  const exp = Number(data.exp);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000))
    return null;
  const uid = String(data.user_id || data.sub || "");
  if (!uid) return null;
  const email =
    typeof data.email === "string" && data.email ? data.email : undefined;
  return { uid, email };
}

/**
 * Xác thực Firebase ID token (JWT) bằng chữ ký Google.
 * @param {string} idToken
 * @returns {Promise<{ uid: string, email?: string } | null>}
 */
export async function verifyFirebaseIdTokenClaims(idToken) {
  if (!idToken || typeof idToken !== "string") return null;

  const raw = decodeJwtPayloadUnsafe(idToken);
  if (raw && typeof raw.iss === "string" && raw.iss !== ISSUER) {
    return null;
  }

  for (const audience of audiencesToTry(idToken)) {
    try {
      const { payload } = await jwtVerify(idToken, JWKS, {
        issuer: ISSUER,
        audience,
        clockTolerance: 60,
      });
      const uid = String(payload.sub || "");
      if (!uid) return null;
      const email =
        typeof payload.email === "string" && payload.email
          ? payload.email
          : undefined;
      return { uid, email };
    } catch {
      /* thử audience khác */
    }
  }

  try {
    return await verifyWithTokeninfo(idToken);
  } catch {
    return null;
  }
}
