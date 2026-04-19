import fs from "fs";
import path from "path";

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
const LISTEN_SET_MAP = {
  1: { key: "Listen83", label: "Bộ đề 83" },
  2: { key: "Listen1", label: "Bộ đề 1" },
  3: { key: "Listen2", label: "Bộ đề 2" },
  4: { key: "Listen3", label: "Bộ đề 3" },
  5: { key: "Listen4", label: "Bộ đề 4" },
  6: { key: "Listen5", label: "Bộ đề 5" },
  7: { key: "Listen6", label: "Bộ đề 6" },
  8: { key: "Listen7", label: "Bộ đề 7" },
  9: { key: "Listen8", label: "Bộ đề 91" },
};

const READING_SET_MAP = {
  1: { key: "Reading83", label: "Bộ đề 83" },
  2: { key: "De1", label: "Bộ đề 1" },
  3: { key: "De2", label: "Bộ đề 2" },
  4: { key: "De3", label: "Bộ đề 3" },
  5: { key: "De4", label: "Bộ đề 4" },
  6: { key: "De5", label: "Bộ đề 5" },
  7: { key: "De6", label: "Bộ đề 6" },
  8: { key: "De7", label: "Bộ đề 7" },
  9: { key: "De8", label: "Bộ đề 91" },
};

export function getSetKey(testType, setNumber) {
  const map = testType === "listen" ? LISTEN_SET_MAP : READING_SET_MAP;
  const target = map[Number(setNumber)] || map[1];
  return target.key;
}
