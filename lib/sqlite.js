import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDirectory = path.join(process.cwd(), "data");
const dbFile = path.join(dataDirectory, "app.db");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_type TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_type TEXT NOT NULL,
    set_key TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    question_type TEXT,
    content TEXT,
    options_json TEXT NOT NULL,
    correct_answer TEXT,
    solution TEXT,
    UNIQUE(test_type, set_key, question_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_type TEXT NOT NULL,
    set_key TEXT NOT NULL,
    label TEXT NOT NULL,
    audio_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 9999,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(test_type, set_key)
  );
`);

export default db;
