import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const databasePath = path.join(dataDir, "pithon.sqlite");

// Each app domain is stored as JSON in one SQLite table, keyed by collection.
const collections = {
  users: "users",
  assignments: "assignments",
  classes: "classes",
  topics: "topics",
  questions: "questions",
  studentRecords: "student_records",
  feedbackLibrary: "feedback_library",
  notifications: "notifications",
  sessions: "sessions",
};

const legacyDataFiles = {
  users: "users.json",
  assignments: "assignments.json",
  classes: "classes.json",
  topics: "topics.json",
  questions: "questions.json",
  studentRecords: "student-records.json",
  feedbackLibrary: "feedback-library.json",
  notifications: "notifications.json",
  sessions: "sessions.json",
};
const refreshSeedCollections = new Set([
  "topics",
  "questions",
  "feedbackLibrary",
  "notifications",
]);

mkdirSync(dataDir, { recursive: true });

const database = new DatabaseSync(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
`);

const countStatement = database.prepare(
  "SELECT COUNT(*) AS count FROM records WHERE collection = ?"
);
const selectAllStatement = database.prepare(
  "SELECT data FROM records WHERE collection = ? ORDER BY created_at ASC"
);
const insertStatement = database.prepare(`
  INSERT INTO records (collection, id, created_at, data)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(collection, id) DO UPDATE SET
    created_at = excluded.created_at,
    data = excluded.data
`);
const deleteCollectionStatement = database.prepare(
  "DELETE FROM records WHERE collection = ?"
);

// Seed files give the app useful starter content without owning user data.
function readLegacyRecords(name) {
  const filePath = path.join(dataDir, legacyDataFiles[name]);

  if (!existsSync(filePath)) {
    return [];
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function normalizeRecord(record) {
  return {
    id: record.id ?? randomUUID(),
    createdAt: record.createdAt ?? new Date().toISOString(),
    ...record,
  };
}

function saveRecord(collection, record) {
  const nextRecord = normalizeRecord(record);

  insertStatement.run(
    collection,
    nextRecord.id,
    nextRecord.createdAt,
    JSON.stringify(nextRecord)
  );

  return nextRecord;
}

function seedFromLegacyJson() {
  for (const [name, collection] of Object.entries(collections)) {
    const { count } = countStatement.get(collection);

    if (count > 0 && !refreshSeedCollections.has(name)) {
      continue;
    }

    for (const record of readLegacyRecords(name)) {
      saveRecord(collection, record);
    }
  }
}

seedFromLegacyJson();

// Small repository facade keeps the service layer independent of SQLite syntax.
function createRepository(name) {
  const collection = collections[name];

  return {
    async all() {
      return selectAllStatement
        .all(collection)
        .map((row) => JSON.parse(row.data));
    },
    async insert(record) {
      return saveRecord(collection, record);
    },
    async replaceAll(records) {
      database.exec("BEGIN IMMEDIATE");

      try {
        deleteCollectionStatement.run(collection);
        const nextRecords = records.map((record) => saveRecord(collection, record));
        database.exec("COMMIT");
        return nextRecords;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

export const repositories = {
  users: createRepository("users"),
  assignments: createRepository("assignments"),
  classes: createRepository("classes"),
  topics: createRepository("topics"),
  questions: createRepository("questions"),
  studentRecords: createRepository("studentRecords"),
  feedbackLibrary: createRepository("feedbackLibrary"),
  notifications: createRepository("notifications"),
  sessions: createRepository("sessions"),
};
