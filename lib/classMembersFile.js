import fs from "fs";
import path from "path";

const MEMBERS_PATH = path.join(process.cwd(), "json", "class-members.json");

function readAll() {
  try {
    const raw = JSON.parse(fs.readFileSync(MEMBERS_PATH, "utf8"));
    if (!Array.isArray(raw)) return [];
    // Defensive parse: ignore malformed rows so API endpoints do not crash.
    return raw.filter((row) => row && typeof row === "object");
  } catch {
    return [];
  }
}

function writeAll(rows) {
  fs.mkdirSync(path.dirname(MEMBERS_PATH), { recursive: true });
  fs.writeFileSync(
    MEMBERS_PATH,
    JSON.stringify(rows, null, 2) + "\n",
    "utf8"
  );
}

/**
 * @param {number[]} ids
 * @returns {Map<number, number>} classId -> số học viên (email duy nhất)
 */
export function countMembersByClassIds(ids) {
  const want = new Set(
    ids
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0)
  );
  const uniqueByClass = new Map();
  for (const id of want) uniqueByClass.set(id, new Set());
  for (const row of readAll()) {
    const cid = Number(row.classId);
    if (!want.has(cid)) continue;
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    uniqueByClass.get(cid).add(email);
  }
  const out = new Map();
  for (const [cid, set] of uniqueByClass) out.set(cid, set.size);
  return out;
}

export function getStudentCountForClass(classId) {
  const map = countMembersByClassIds([classId]);
  return map.get(Number(classId)) ?? 0;
}

/** Tổng số học viên khác nhau (theo email) đã gán ít nhất một lớp. */
export function countDistinctMemberEmails() {
  const set = new Set();
  for (const row of readAll()) {
    const email = String(row.email ?? "").trim().toLowerCase();
    if (email) set.add(email);
  }
  return set.size;
}

/**
 * Danh sách học viên trong lớp (mọi trường lưu trong JSON + email/joinedAt chuẩn hoá), mới nhất trước.
 * @returns {Record<string, unknown>[]}
 */
export function listMembersForClass(classId) {
  const n = Number(classId);
  if (!Number.isInteger(n) || n < 1) return [];
  return readAll()
    .filter((r) => Number(r.classId) === n)
    .map((r) => ({
      ...r,
      classId: n,
      email: String(r.email ?? "").trim().toLowerCase(),
      joinedAt:
        typeof r.joinedAt === "string" && r.joinedAt.trim()
          ? r.joinedAt.trim()
          : null,
    }))
    .filter((r) => r.email)
    .sort(
      (a, b) =>
        new Date(b.joinedAt || 0).getTime() -
        new Date(a.joinedAt || 0).getTime()
    );
}

/**
 * Xóa toàn bộ bản ghi thuộc lớp (khi xóa lớp).
 * @returns {number} số bản ghi đã xóa
 */
export function deleteMembersForClass(classId) {
  const n = Number(classId);
  if (!Number.isInteger(n) || n < 1) return 0;
  const rows = readAll();
  const next = rows.filter((r) => Number(r.classId) !== n);
  const removed = rows.length - next.length;
  if (removed) writeAll(next);
  return removed;
}

export function hasAnyMembershipForEmail(email) {
  const em = String(email ?? "").trim().toLowerCase();
  if (!em) return false;
  return readAll().some(
    (r) => String(r.email ?? "").trim().toLowerCase() === em
  );
}

/**
 * Gán học viên vào lớp (email duy nhất mỗi lớp).
 * @returns {{ classId: number, email: string } | null}
 */
export function upsertClassMember(classId, email) {
  const cid = Number(classId);
  if (!Number.isInteger(cid) || cid < 1) return null;
  const em = String(email ?? "").trim().toLowerCase();
  if (!em || !em.includes("@")) return null;
  const rows = readAll();
  const next = rows.filter(
    (r) =>
      !(
        Number(r.classId) === cid &&
        String(r.email ?? "").trim().toLowerCase() === em
      )
  );
  next.push({
    classId: cid,
    email: em,
    joinedAt: new Date().toISOString(),
  });
  writeAll(next);
  return { classId: cid, email: em };
}
