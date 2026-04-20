import { listMembersForClass } from "@/lib/classMembersFile";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const TABLE = "quiz_results";

function mapResultRow(row) {
  return {
    id: row.id,
    testType: row.test_type,
    setNumber: row.set_number,
    score: row.score,
    totalQuestions: row.total_questions,
    answers: row.answers ?? null,
    createdAt: row.created_at ?? null,
    studentEmail: row.student_email ?? undefined,
    setKey: row.set_key ?? undefined,
  };
}

/**
 * @param {{ testType?: string | null; setNumber?: string | null; limit?: number; studentEmail?: string | null }} opts
 * Nếu `studentEmail` có giá trị — chỉ kết quả của học viên đó (email chữ thường).
 */
export async function listResults({ testType, setNumber, limit, studentEmail }) {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  const client = getSupabaseServerClient();
  let query = client
    .from(TABLE)
    .select("*")
    .order("id", { ascending: false })
    .limit(safeLimit);
  if (studentEmail) {
    query = query.eq("student_email", String(studentEmail).trim().toLowerCase());
  }
  if (testType) query = query.eq("test_type", testType);
  if (setNumber != null && setNumber !== "") {
    query = query.eq("set_number", Number(setNumber));
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapResultRow);
}

/** Số bản ghi không có `studentEmail` (làm trước khi lưu email hoặc do admin thử). */
export async function countResultsWithoutStudentEmail() {
  const client = getSupabaseServerClient();
  const { count, error } = await client
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .or("student_email.is.null,student_email.eq.");
  if (error) throw error;
  return count ?? 0;
}

/**
 * Thống kê kết quả làm bài theo email.
 * Mặc định chỉ đếm bản ghi có `studentEmail` trùng email.
 * @param {{ orphanAttributionEmail?: string | null }} [options]
 * Nếu `orphanAttributionEmail` là email hợp lệ trong `emails` (thường khi lớp chỉ có 1 học viên),
 * các bản ghi **không** có `studentEmail` cũng được cộng vào email đó để số liệu khớp dữ liệu cũ.
 */
export async function summarizeResultsForEmails(emails, options = {}) {
  const { orphanAttributionEmail = null } = options;
  const norm = [
    ...new Set(
      emails
        .map((e) => String(e ?? "").trim().toLowerCase())
        .filter((e) => e.length > 0)
    ),
  ];
  const want = new Set(norm);
  const empty = () => ({
    attemptCount: 0,
    lastAttemptAt: null,
    lastScore: null,
    lastTotalQuestions: null,
    lastTestType: null,
    lastSetNumber: null,
    lastSetKey: null,
  });
  const out = {};
  for (const e of norm) out[e] = empty();
  if (!norm.length) return out;

  const groups = new Map();
  for (const e of norm) groups.set(e, []);

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select(
      "id, test_type, set_number, score, total_questions, answers, created_at, student_email, set_key"
    );
  if (error) throw error;

  const orphans = [];
  for (const raw of data ?? []) {
    const r = mapResultRow(raw);
    const em = String(r.studentEmail || "").trim().toLowerCase();
    if (em && want.has(em)) {
      groups.get(em).push(r);
    } else if (!em) {
      orphans.push(r);
    }
  }

  const attr = String(orphanAttributionEmail || "").trim().toLowerCase();
  if (attr && want.has(attr)) {
    for (const r of orphans) groups.get(attr).push(r);
  }

  for (const em of norm) {
    const list = groups.get(em) || [];
    list.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    const latest = list[0];
    out[em] = {
      attemptCount: list.length,
      lastAttemptAt:
        typeof latest?.createdAt === "string" ? latest.createdAt : null,
      lastScore: typeof latest?.score === "number" ? latest.score : null,
      lastTotalQuestions:
        typeof latest?.totalQuestions === "number"
          ? latest.totalQuestions
          : null,
      lastTestType:
        latest?.testType != null ? String(latest.testType) : null,
      lastSetNumber:
        typeof latest?.setNumber === "number" ? latest.setNumber : null,
      lastSetKey:
        latest?.setKey != null && String(latest.setKey).trim()
          ? String(latest.setKey).trim()
          : null,
    };
  }

  return out;
}

/**
 * Kết quả làm bài gắn với học viên trong ngữ cảnh lớp (cùng quy tắc orphan khi lớp 1 người).
 * @returns {object[] | null}
 */
export async function listResultsForClassMember(classId, memberEmail) {
  const members = await listMembersForClass(classId);
  const norm = String(memberEmail ?? "").trim().toLowerCase();
  if (!norm || !members.some((m) => m.email === norm)) return null;

  const orphanAttributionEmail =
    members.length === 1 ? members[0].email : null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select(
      "id, test_type, set_number, score, total_questions, answers, created_at, student_email, set_key"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = [];
  for (const raw of data ?? []) {
    const r = mapResultRow(raw);
    const em = String(r.studentEmail || "").trim().toLowerCase();
    if (em && em === norm) rows.push(r);
    else if (!em && orphanAttributionEmail === norm) rows.push(r);
  }
  rows.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );
  return rows;
}

/**
 * Gom theo bộ đề (testType + setNumber), mỗi nhóm sắp mới nhất trước.
 */
export function groupQuizRowsByDeck(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.testType}-${r.setNumber}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  const out = [];
  for (const [, attempts] of map) {
    attempts.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    const latest = attempts[0];
    out.push({
      deckKey: `${latest.testType}-${latest.setNumber}`,
      testType: latest.testType,
      setNumber: latest.setNumber,
      setKey: latest.setKey ?? null,
      latest,
      attempts,
      attemptCount: attempts.length,
    });
  }
  out.sort(
    (a, b) =>
      new Date(b.latest.createdAt || 0).getTime() -
      new Date(a.latest.createdAt || 0).getTime()
  );
  return out;
}

export async function appendResult({
  testType,
  setNumber,
  score,
  totalQuestions,
  answers,
  setKey,
  studentEmail,
}) {
  const em =
    studentEmail != null && String(studentEmail).trim()
      ? String(studentEmail).trim().toLowerCase()
      : undefined;
  const payload = {
    test_type: testType,
    set_number: setNumber,
    score,
    total_questions: typeof totalQuestions === "number" ? totalQuestions : 0,
    answers: answers ?? null,
    created_at: new Date().toISOString(),
    student_email: em ?? null,
    set_key:
      setKey != null && String(setKey).trim() ? String(setKey).trim() : null,
  };
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .insert(payload)
    .select(
      "id, test_type, set_number, score, total_questions, answers, created_at, student_email, set_key"
    )
    .single();
  if (error) throw error;
  const row = mapResultRow(data);
  return { id: row.id, row };
}
