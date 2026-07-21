import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

const dataFiles = {
  users: "users.json",
  assignments: "assignments.json",
  classes: "classes.json",
  questions: "questions.json",
  studentRecords: "student-records.json",
  feedbackLibrary: "feedback-library.json",
  sessions: "sessions.json",
};

async function readCollection(name) {
  const filePath = path.join(dataDir, dataFiles[name]);

  try {
    const file = await readFile(filePath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      await mkdir(dataDir, { recursive: true });
      await writeFile(filePath, "[]");
      return [];
    }

    throw error;
  }
}

async function writeCollection(name, records) {
  const filePath = path.join(dataDir, dataFiles[name]);

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`);
}

function createRepository(name) {
  return {
    async all() {
      return readCollection(name);
    },
    async insert(record) {
      const records = await readCollection(name);
      const nextRecord = {
        id: record.id ?? randomUUID(),
        createdAt: record.createdAt ?? new Date().toISOString(),
        ...record,
      };

      records.push(nextRecord);
      await writeCollection(name, records);

      return nextRecord;
    },
    async replaceAll(records) {
      await writeCollection(name, records);
      return records;
    },
  };
}

export const repositories = {
  users: createRepository("users"),
  assignments: createRepository("assignments"),
  classes: createRepository("classes"),
  questions: createRepository("questions"),
  studentRecords: createRepository("studentRecords"),
  feedbackLibrary: createRepository("feedbackLibrary"),
  sessions: createRepository("sessions"),
};
