import fs from "fs";
import path from "path";
import { getSetKey as getSetKeyFromUi } from "@/lib/quizSetUiMaps";

const META_PATH = path.join(process.cwd(), "json", "quiz-sets.json");

function ensureShape(raw) {
  return {
    listen: typeof raw.listen === "object" && raw.listen ? raw.listen : {},
    reading: typeof raw.reading === "object" && raw.reading ? raw.reading : {},
  };
}

export function readQuizSetsMeta() {
  try {
    const t = fs.readFileSync(META_PATH, "utf8");
    return ensureShape(JSON.parse(t));
  } catch {
    return { listen: {}, reading: {} };
  }
}

export function writeQuizSetsMeta(meta) {
  fs.mkdirSync(path.dirname(META_PATH), { recursive: true });
  fs.writeFileSync(
    META_PATH,
    JSON.stringify(ensureShape(meta), null, 2) + "\n",
    "utf8"
  );
}

/** URL nghe trong quiz-sets.json (listen.*.audioUrl) — dùng khi payload/API cần bổ sung sau meta từng set. */
export function getListenAudioFallbackBySetKey(setKey) {
  if (!setKey || typeof setKey !== "string") return "";
  const url = readQuizSetsMeta().listen[setKey]?.audioUrl;
  return typeof url === "string" && url.trim() ? url.trim() : "";
}

export function getMaxDisplayOrder(testType) {
  const meta = readQuizSetsMeta();
  const bucket = testType === "listen" ? meta.listen : meta.reading;
  let max = 0;
  for (const k of Object.keys(bucket)) {
    const o = Number(bucket[k]?.displayOrder);
    if (Number.isFinite(o) && o > max) max = o;
  }
  return max;
}

/** Ánh xạ số thứ tự UI (setNumber) → setKey trong JSON — dùng khi API không truyền setKey. */
export function getSetKey(testType, setNumber) {
  return getSetKeyFromUi(testType, setNumber);
}

export { getSetLabel } from "@/lib/quizSetUiMaps";
