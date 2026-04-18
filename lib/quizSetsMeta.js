import fs from "fs";
import path from "path";
import { LISTEN_AUDIO_BY_SET_KEY } from "@/lib/testSets";

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

/** Audio mặc định theo setKey (trùng key trong Listen.json) khi chưa có trong quiz-sets.json */
export function getListenAudioFallbackBySetKey(setKey) {
  if (!setKey || typeof setKey !== "string") return "";
  return LISTEN_AUDIO_BY_SET_KEY[setKey] || "";
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
