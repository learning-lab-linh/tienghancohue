import fs from "fs";
import path from "path";

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

export function listResults({ testType, setNumber, limit }) {
  let rows = readAll();
  if (testType) rows = rows.filter((r) => r.testType === testType);
  if (setNumber != null && setNumber !== "")
    rows = rows.filter((r) => r.setNumber === Number(setNumber));
  rows.sort((a, b) => (b.id || 0) - (a.id || 0));
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  return rows.slice(0, safeLimit);
}

export function appendResult({
  testType,
  setNumber,
  score,
  totalQuestions,
  answers,
}) {
  const rows = readAll();
  const maxId = rows.reduce((m, r) => Math.max(m, r.id || 0), 0);
  const id = maxId + 1;
  const createdAt = new Date().toISOString();
  const row = {
    id,
    testType,
    setNumber,
    score,
    totalQuestions: typeof totalQuestions === "number" ? totalQuestions : 0,
    answers: answers ?? null,
    createdAt,
  };
  rows.push(row);
  writeAll(rows);
  return { id, row };
}
