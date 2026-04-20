import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseDotEnv(dotEnvPath) {
  if (!fs.existsSync(dotEnvPath)) return {};
  const raw = fs.readFileSync(dotEnvPath, "utf8");
  const out = {};
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function getEnv(key, fallback, fileEnv) {
  const val = process.env[key] ?? fileEnv[key] ?? fallback;
  return typeof val === "string" ? val.trim() : "";
}

function normalizeQuestion(row, index) {
  const options = Array.isArray(row?.options) ? [...row.options] : ["", "", "", ""];
  while (options.length < 4) options.push("");
  const id = Number(row?.id ?? index + 1);
  return {
    question_id: Number.isInteger(id) && id > 0 ? id : index + 1,
    type: row?.type ?? "",
    content: typeof row?.content === "string" ? row.content : "",
    options: options.slice(0, 4),
    correct_answer:
      String(row?.correctAnswer ?? "1").replace(/[^1-4]/g, "") || "1",
    solution: row?.solution || "Dang cap nhat....",
  };
}

function collectSetKeys(payload, metaBucket) {
  const fromPayload = Object.keys(payload || {}).filter((k) =>
    Array.isArray(payload[k])
  );
  const fromMeta = Object.keys(metaBucket || {});
  return [...new Set([...fromPayload, ...fromMeta])];
}

async function main() {
  const fileEnv = parseDotEnv(path.join(ROOT, ".env"));
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL", "", fileEnv);
  const serviceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY", "", fileEnv);

  if (!url || !serviceRole) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env."
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const listenPayload = readJson("json/Listen.json");
  const readingPayload = readJson("json/Reading.json");
  const meta = readJson("json/quiz-sets.json");

  const jobs = [
    { testType: "listen", payload: listenPayload, metaBucket: meta.listen || {} },
    { testType: "reading", payload: readingPayload, metaBucket: meta.reading || {} },
  ];

  let totalSets = 0;
  let totalQuestions = 0;

  for (const job of jobs) {
    const keys = collectSetKeys(job.payload, job.metaBucket);
    for (const setKey of keys) {
      const m = job.metaBucket?.[setKey] || {};
      const setRow = {
        test_type: job.testType,
        set_key: setKey,
        label: String(m.label || setKey),
        audio_url: job.testType === "listen" ? String(m.audioUrl || "") : "",
        display_order:
          typeof m.displayOrder === "number" && Number.isFinite(m.displayOrder)
            ? m.displayOrder
            : 9999,
      };

      const { error: setError } = await supabase
        .from("topik_sets")
        .upsert(setRow, { onConflict: "test_type,set_key" });
      if (setError) throw setError;
      totalSets += 1;

      const rows = Array.isArray(job.payload?.[setKey]) ? job.payload[setKey] : [];
      const questions = rows.map((row, idx) => {
        const q = normalizeQuestion(row, idx);
        return {
          test_type: job.testType,
          set_key: setKey,
          question_id: q.question_id,
          type: q.type,
          content: q.content,
          options: q.options,
          correct_answer: q.correct_answer,
          solution: q.solution,
        };
      });

      const { error: deleteError } = await supabase
        .from("topik_questions")
        .delete()
        .eq("test_type", job.testType)
        .eq("set_key", setKey);
      if (deleteError) throw deleteError;

      if (questions.length > 0) {
        const { error: questionError } = await supabase
          .from("topik_questions")
          .insert(questions);
        if (questionError) throw questionError;
        totalQuestions += questions.length;
      }
    }
  }

  console.log(
    `Done. Upserted ${totalSets} sets and inserted ${totalQuestions} questions to Supabase.`
  );
}

main().catch((error) => {
  console.error("Migration failed:", error?.message || error);
  process.exit(1);
});
