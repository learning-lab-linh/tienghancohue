import fs from "fs";
import path from "path";

const LISTEN_TEMPLATE_KEY = "Listen83";
const READING_TEMPLATE_KEY = "Reading91";

/**
 * Clone cấu trúc câu hỏi từ đề mẫu (Listen83 / Reading91), để trống content và giữ type/options schema.
 */
export function loadExamTemplateRows(testType) {
  const fileName =
    testType === "listen"
      ? "Listen.json"
      : testType === "reading"
        ? "Reading.json"
        : null;
  if (!fileName) {
    throw new Error("testType phải là listen | reading");
  }

  const filePath = path.join(process.cwd(), "json", fileName);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const templateKey =
    testType === "listen" ? LISTEN_TEMPLATE_KEY : READING_TEMPLATE_KEY;
  const rows = raw[templateKey];
  if (!Array.isArray(rows) || rows.length !== 50) {
    throw new Error(`Thiếu mẫu ${templateKey} (cần đúng 50 câu)`);
  }

  return rows.map((q) => {
    const options = Array.isArray(q.options)
      ? [...q.options]
      : ["", "", "", ""];
    while (options.length < 4) options.push("");
    return {
      id: String(q.id),
      type: q.type ?? "",
      options: options.slice(0, 4),
      correctAnswer: String(q.correctAnswer ?? "1"),
      solution: q.solution || "Đang cập nhật....",
      content: "",
    };
  });
}

export function readJsonPayload(testType) {
  const fileName =
    testType === "listen" ? "Listen.json" : "Reading.json";
  const filePath = path.join(process.cwd(), "json", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJsonPayload(testType, payload) {
  const fileName =
    testType === "listen" ? "Listen.json" : "Reading.json";
  const filePath = path.join(process.cwd(), "json", fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}
