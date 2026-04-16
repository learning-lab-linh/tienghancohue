import fs from "fs";
import path from "path";
import db from "../lib/sqlite.js";

const root = process.cwd();
const listenJsonPath = path.join(root, "json", "Listen.json");
const readingJsonPath = path.join(root, "json", "Reading.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function seedByType(testType, payload) {
  const insertQuestion = db.prepare(`
    INSERT INTO quiz_questions (
      test_type,
      set_key,
      question_id,
      question_type,
      content,
      options_json,
      correct_answer,
      solution
    )
    VALUES (
      @testType,
      @setKey,
      @questionId,
      @questionType,
      @content,
      @optionsJson,
      @correctAnswer,
      @solution
    )
    ON CONFLICT(test_type, set_key, question_id) DO UPDATE SET
      question_type = excluded.question_type,
      content = excluded.content,
      options_json = excluded.options_json,
      correct_answer = excluded.correct_answer,
      solution = excluded.solution
  `);

  const transaction = db.transaction(() => {
    let rows = 0;
    for (const [setKey, questions] of Object.entries(payload)) {
      if (!Array.isArray(questions)) continue;
      for (const question of questions) {
        insertQuestion.run({
          testType,
          setKey,
          questionId: Number(question.id),
          questionType: question.type || "",
          content: question.content || "",
          optionsJson: JSON.stringify(question.options || []),
          correctAnswer: question.correctAnswer || "",
          solution: question.solution || "",
        });
        rows += 1;
      }
    }
    return rows;
  });

  return transaction();
}

const listenPayload = readJson(listenJsonPath);
const readingPayload = readJson(readingJsonPath);

const listenCount = seedByType("listen", listenPayload);
const readingCount = seedByType("reading", readingPayload);

console.log(`Seed thanh cong: listen=${listenCount}, reading=${readingCount}`);
