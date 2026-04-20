import { getSupabaseServerClient } from "@/lib/supabaseServer";

const SETS_TABLE = "topik_sets";
const QUESTIONS_TABLE = "topik_questions";

function normalizeTestType(testType) {
  return testType === "listen" || testType === "reading" ? testType : null;
}

function normalizeQuestionRow(row) {
  const options = Array.isArray(row.options) ? row.options : [];
  const fixed = [...options];
  while (fixed.length < 4) fixed.push("");
  return {
    id: String(row.question_id),
    type: row.type || "",
    content: row.content || "",
    options: fixed.slice(0, 4),
    correctAnswer: String(row.correct_answer || ""),
    solution: row.solution || "",
  };
}

export async function listTopikSetsByType(testType) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) return [];
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(SETS_TABLE)
    .select("set_key, label, audio_url, display_order")
    .eq("test_type", normalizedType)
    .order("display_order", { ascending: true })
    .order("set_key", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    setKey: row.set_key,
    label: row.label,
    audioUrl: row.audio_url || "",
    displayOrder: Number.isFinite(row.display_order) ? row.display_order : 9999,
  }));
}

export async function listTopikQuestionSetKeysByType(testType) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) return [];
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(QUESTIONS_TABLE)
    .select("set_key")
    .eq("test_type", normalizedType);
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => String(row.set_key || "").trim()).filter(Boolean))];
}

export async function getTopikSetByKey(testType, setKey) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) return null;
  const key = String(setKey ?? "").trim();
  if (!key) return null;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(SETS_TABLE)
    .select("set_key, label, audio_url, display_order")
    .eq("test_type", normalizedType)
    .eq("set_key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    setKey: data.set_key,
    label: data.label,
    audioUrl: data.audio_url || "",
    displayOrder: Number.isFinite(data.display_order) ? data.display_order : 9999,
  };
}

export async function getTopikSetMaxDisplayOrder(testType) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) return 0;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(SETS_TABLE)
    .select("display_order")
    .eq("test_type", normalizedType)
    .order("display_order", { ascending: false })
    .limit(1);
  if (error) throw error;
  return Number(data?.[0]?.display_order || 0);
}

export async function createTopikSet({
  testType,
  setKey,
  label,
  audioUrl = "",
  displayOrder,
}) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) throw new Error("Invalid testType");
  const key = String(setKey ?? "").trim();
  if (!key) throw new Error("setKey is required");

  const payload = {
    test_type: normalizedType,
    set_key: key,
    label: String(label ?? "").trim(),
    audio_url: normalizedType === "listen" ? String(audioUrl ?? "").trim() : "",
    display_order: Number.isInteger(displayOrder) ? displayOrder : 9999,
  };
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(SETS_TABLE)
    .insert(payload)
    .select("set_key, label, audio_url, display_order")
    .single();
  if (error) throw error;
  return {
    setKey: data.set_key,
    label: data.label,
    audioUrl: data.audio_url || "",
    displayOrder: data.display_order,
  };
}

export async function updateTopikSetAudio({ testType, setKey, audioUrl }) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) throw new Error("Invalid testType");
  if (normalizedType !== "listen") return;
  const key = String(setKey ?? "").trim();
  if (!key) return;
  const client = getSupabaseServerClient();
  const { error } = await client
    .from(SETS_TABLE)
    .update({ audio_url: String(audioUrl ?? "").trim() })
    .eq("test_type", normalizedType)
    .eq("set_key", key);
  if (error) throw error;
}

export async function listTopikQuestionsBySet(testType, setKey) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) return [];
  const key = String(setKey ?? "").trim();
  if (!key) return [];
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(QUESTIONS_TABLE)
    .select(
      "question_id, type, content, options, correct_answer, solution"
    )
    .eq("test_type", normalizedType)
    .eq("set_key", key)
    .order("question_id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizeQuestionRow);
}

export async function upsertTopikQuestion({
  testType,
  setKey,
  id,
  type,
  content,
  options,
  correctAnswer,
  solution,
}) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) throw new Error("Invalid testType");
  const key = String(setKey ?? "").trim();
  if (!key) throw new Error("setKey is required");
  const questionId = Number(id);
  if (!Number.isInteger(questionId) || questionId < 1) {
    throw new Error("Invalid question id");
  }
  const safeOptions = Array.isArray(options) ? [...options] : [];
  while (safeOptions.length < 4) safeOptions.push("");
  const payload = {
    test_type: normalizedType,
    set_key: key,
    question_id: questionId,
    type: String(type ?? ""),
    content: String(content ?? ""),
    options: safeOptions.slice(0, 4),
    correct_answer: String(correctAnswer ?? ""),
    solution: String(solution ?? ""),
  };
  const client = getSupabaseServerClient();
  const { error } = await client
    .from(QUESTIONS_TABLE)
    .upsert(payload, { onConflict: "test_type,set_key,question_id" });
  if (error) throw error;
}

export async function replaceTopikQuestions({
  testType,
  setKey,
  questions,
}) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) throw new Error("Invalid testType");
  const key = String(setKey ?? "").trim();
  if (!key) throw new Error("setKey is required");
  const client = getSupabaseServerClient();
  const { error: deleteError } = await client
    .from(QUESTIONS_TABLE)
    .delete()
    .eq("test_type", normalizedType)
    .eq("set_key", key);
  if (deleteError) throw deleteError;

  const rows = (questions ?? []).map((q, idx) => {
    const id = Number(q.id ?? idx + 1);
    const options = Array.isArray(q.options) ? [...q.options] : ["", "", "", ""];
    while (options.length < 4) options.push("");
    return {
      test_type: normalizedType,
      set_key: key,
      question_id: id,
      type: String(q.type ?? ""),
      content: typeof q.content === "string" ? q.content : "",
      options: options.slice(0, 4),
      correct_answer:
        String(q.correctAnswer ?? "1").replace(/[^1-4]/g, "") || "1",
      solution: q.solution || "Dang cap nhat....",
    };
  });
  if (!rows.length) return;

  const { error: insertError } = await client
    .from(QUESTIONS_TABLE)
    .insert(rows);
  if (insertError) throw insertError;
}

export async function cloneTemplateQuestionsForSet({ testType, setKey }) {
  const normalizedType = normalizeTestType(testType);
  if (!normalizedType) throw new Error("Invalid testType");
  const key = String(setKey ?? "").trim();
  if (!key) throw new Error("setKey is required");

  const templateKey = normalizedType === "listen" ? "Listen83" : "Reading91";
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(QUESTIONS_TABLE)
    .select("question_id, type, options, correct_answer, solution")
    .eq("test_type", normalizedType)
    .eq("set_key", templateKey)
    .order("question_id", { ascending: true });
  if (error) throw error;

  const source = Array.isArray(data) && data.length
    ? data
    : Array.from({ length: 50 }, (_, i) => ({
        question_id: i + 1,
        type: "",
        options: ["", "", "", ""],
        correct_answer: "1",
        solution: "Dang cap nhat....",
      }));

  const rows = source.map((row) => {
    const options = Array.isArray(row.options) ? [...row.options] : ["", "", "", ""];
    while (options.length < 4) options.push("");
    return {
      test_type: normalizedType,
      set_key: key,
      question_id: Number(row.question_id),
      type: String(row.type ?? ""),
      content: "",
      options: options.slice(0, 4),
      correct_answer:
        String(row.correct_answer ?? "1").replace(/[^1-4]/g, "") || "1",
      solution: row.solution || "Dang cap nhat....",
    };
  });

  const { error: insertError } = await client
    .from(QUESTIONS_TABLE)
    .insert(rows);
  if (insertError) throw insertError;

  return rows.map((row) => ({
    id: String(row.question_id),
    type: row.type,
    options: row.options,
    correctAnswer: row.correct_answer,
    solution: row.solution,
    content: row.content,
  }));
}
