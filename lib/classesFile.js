import fs from "fs";
import path from "path";

const CLASSES_PATH = path.join(process.cwd(), "json", "classes.json");

function readAll() {
  try {
    const raw = JSON.parse(fs.readFileSync(CLASSES_PATH, "utf8"));
    if (!Array.isArray(raw)) return [];
    // Defensive parse: ignore malformed rows so API endpoints do not crash.
    return raw.filter((row) => row && typeof row === "object");
  } catch {
    return [];
  }
}

function writeAll(rows) {
  fs.mkdirSync(path.dirname(CLASSES_PATH), { recursive: true });
  fs.writeFileSync(
    CLASSES_PATH,
    JSON.stringify(rows, null, 2) + "\n",
    "utf8"
  );
}

function generateJoinCode(rows) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = new Set(rows.map((c) => c.code).filter(Boolean));
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let s = "";
    for (let i = 0; i < 6; i += 1) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!used.has(s)) return s;
  }
  return `C${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export function listClasses({ includeArchived = false } = {}) {
  let rows = readAll();
  if (!includeArchived) rows = rows.filter((r) => !r.archived);
  rows.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );
  return rows;
}

export function getClassById(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  return readAll().find((r) => r.id === n) || null;
}

/** Mã lớp 6 ký tự (không phân biệt hoa thường). Chỉ lớp chưa lưu trữ. */
export function getClassByJoinCode(code) {
  const raw = String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!raw) return null;
  return (
    readAll().find((r) => String(r.code).toUpperCase() === raw && !r.archived) ||
    null
  );
}

export function createClass({ name, description, schedule, schoolYear, teacher }) {
  const rows = readAll();
  const maxId = rows.reduce((m, r) => Math.max(m, r.id || 0), 0);
  const id = maxId + 1;
  const row = {
    id,
    name: String(name).trim(),
    description: String(description ?? "").trim(),
    schedule: String(schedule ?? "").trim(),
    schoolYear: String(schoolYear ?? "").trim(),
    teacher: String(teacher ?? "").trim().slice(0, 120),
    code: generateJoinCode(rows),
    archived: false,
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  writeAll(rows);
  return row;
}

export function updateClass(id, patch) {
  const rows = readAll();
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  const idx = rows.findIndex((r) => r.id === n);
  if (idx === -1) return null;
  const cur = rows[idx];
  const next = { ...cur };
  if (patch.name != null) next.name = String(patch.name).trim();
  if (patch.description != null)
    next.description = String(patch.description).trim();
  if (patch.schedule != null) next.schedule = String(patch.schedule).trim();
  if (patch.schoolYear != null)
    next.schoolYear = String(patch.schoolYear).trim();
  if (patch.teacher != null)
    next.teacher = String(patch.teacher).trim().slice(0, 120);
  if (typeof patch.archived === "boolean") next.archived = patch.archived;
  rows[idx] = next;
  writeAll(rows);
  return next;
}

export function deleteClass(id) {
  const rows = readAll();
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return false;
  const next = rows.filter((r) => r.id !== n);
  if (next.length === rows.length) return false;
  writeAll(next);
  return true;
}
