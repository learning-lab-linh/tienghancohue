import fs from "fs";
import path from "path";

import { listMembersForClass } from "@/lib/classMembersFile";

const RESULTS_PATH = path.join(process.cwd(), "json", "quiz-results.json");

function readAll() {
  try {
    const raw = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeAll(rows) {
  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(
    RESULTS_PATH,
    JSON.stringify(rows, null, 2) + "\n",
    "utf8"
  );
}

/**
 * @param {{ testType?: string | null; setNumber?: string | null; limit?: number; studentEmail?: string | null }} opts
 * Nếu `studentEmail` có giá trị — chỉ kết quả của học viên đó (email chữ thường).
 */
export function listResults({ testType, setNumber, limit, studentEmail }) {
  let rows = readAll();
  if (studentEmail) {
    const e = String(studentEmail).trim().toLowerCase();
    rows = rows.filter(
      (r) => String(r.studentEmail || "").toLowerCase() === e
    );
  }
  if (testType) rows = rows.filter((r) => r.testType === testType);
  if (setNumber != null && setNumber !== "")
    rows = rows.filter((r) => r.setNumber === Number(setNumber));
  rows.sort((a, b) => (b.id || 0) - (a.id || 0));
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  return rows.slice(0, safeLimit);
}

/** Số bản ghi không có `studentEmail` (làm trước khi lưu email hoặc do admin thử). */
export function countResultsWithoutStudentEmail() {
  return readAll().filter(
    (r) => !String(r.studentEmail || "").trim()
  ).length;
}

/**
 * Thống kê kết quả làm bài theo email.
 * Mặc định chỉ đếm bản ghi có `studentEmail` trùng email.
 * @param {{ orphanAttributionEmail?: string | null }} [options]
 * Nếu `orphanAttributionEmail` là email hợp lệ trong `emails` (thường khi lớp chỉ có 1 học viên),
 * các bản ghi **không** có `studentEmail` cũng được cộng vào email đó để số liệu khớp dữ liệu cũ.
 */
export function summarizeResultsForEmails(emails, options = {}) {
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

  const groups = new Map();
  for (const e of norm) groups.set(e, []);

  const orphans = [];
  for (const r of readAll()) {
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
export function listResultsForClassMember(classId, memberEmail) {
  const members = listMembersForClass(classId);
  const norm = String(memberEmail ?? "").trim().toLowerCase();
  if (!norm || !members.some((m) => m.email === norm)) return null;

  const orphanAttributionEmail =
    members.length === 1 ? members[0].email : null;

  const rows = [];
  for (const r of readAll()) {
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

export function appendResult({
  testType,
  setNumber,
  score,
  totalQuestions,
  answers,
  setKey,
  studentEmail,
}) {
  const rows = readAll();
  const maxId = rows.reduce((m, r) => Math.max(m, r.id || 0), 0);
  const id = maxId + 1;
  const createdAt = new Date().toISOString();
  const em =
    studentEmail != null && String(studentEmail).trim()
      ? String(studentEmail).trim().toLowerCase()
      : undefined;
  const row = {
    id,
    testType,
    setNumber,
    score,
    totalQuestions: typeof totalQuestions === "number" ? totalQuestions : 0,
    answers: answers ?? null,
    createdAt,
    ...(em ? { studentEmail: em } : {}),
    ...(setKey != null && String(setKey).trim()
      ? { setKey: String(setKey).trim() }
      : {}),
  };
  rows.push(row);
  writeAll(rows);
  return { id, row };
}
