import { getSupabaseServerClient } from "@/lib/supabaseServer";

const TABLE = "class_members";

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function mapMemberRow(row) {
  return {
    classId: Number(row.class_id),
    email: normalizeEmail(row.email),
    joinedAt:
      typeof row.joined_at === "string" && row.joined_at.trim()
        ? row.joined_at.trim()
        : null,
  };
}

/**
 * @param {number[]} ids
 * @returns {Map<number, number>} classId -> số học viên (email duy nhất)
 */
export async function countMembersByClassIds(ids) {
  const want = new Set(
    ids
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0)
  );
  const wantIds = [...want];
  if (!wantIds.length) return new Map();

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select("class_id, email")
    .in("class_id", wantIds);
  if (error) throw error;

  const uniqueByClass = new Map();
  for (const id of want) uniqueByClass.set(id, new Set());
  for (const row of data ?? []) {
    const cid = Number(row.class_id);
    if (!want.has(cid)) continue;
    const email = normalizeEmail(row.email);
    if (!email) continue;
    uniqueByClass.get(cid).add(email);
  }
  const out = new Map();
  for (const [cid, set] of uniqueByClass) out.set(cid, set.size);
  return out;
}

export async function getStudentCountForClass(classId) {
  const map = await countMembersByClassIds([classId]);
  return map.get(Number(classId)) ?? 0;
}

/** Tổng số học viên khác nhau (theo email) đã gán ít nhất một lớp. */
export async function countDistinctMemberEmails() {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from(TABLE).select("email");
  if (error) throw error;
  const set = new Set();
  for (const row of data ?? []) {
    const email = normalizeEmail(row.email);
    if (email) set.add(email);
  }
  return set.size;
}

/**
 * Danh sách học viên trong lớp (mọi trường lưu trong JSON + email/joinedAt chuẩn hoá), mới nhất trước.
 * @returns {Record<string, unknown>[]}
 */
export async function listMembersForClass(classId) {
  const n = Number(classId);
  if (!Number.isInteger(n) || n < 1) return [];
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select("class_id, email, joined_at")
    .eq("class_id", n)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapMemberRow).filter((r) => r.email);
}

/**
 * Xóa toàn bộ bản ghi thuộc lớp (khi xóa lớp).
 * @returns {number} số bản ghi đã xóa
 */
export async function deleteMembersForClass(classId) {
  const n = Number(classId);
  if (!Number.isInteger(n) || n < 1) return 0;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .delete()
    .eq("class_id", n)
    .select("class_id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function hasAnyMembershipForEmail(email) {
  const em = normalizeEmail(email);
  if (!em) return false;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select("class_id")
    .eq("email", em)
    .limit(1);
  if (error) throw error;
  return Boolean(data?.length);
}

/**
 * Gán học viên vào lớp (email duy nhất mỗi lớp).
 * @returns {{ classId: number, email: string } | null}
 */
export async function upsertClassMember(classId, email) {
  const cid = Number(classId);
  if (!Number.isInteger(cid) || cid < 1) return null;
  const em = normalizeEmail(email);
  if (!em || !em.includes("@")) return null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .upsert(
      {
        class_id: cid,
        email: em,
        joined_at: new Date().toISOString(),
      },
      { onConflict: "class_id,email" }
    )
    .select("class_id, email, joined_at")
    .single();
  if (error) throw error;
  return mapMemberRow(data);
}
