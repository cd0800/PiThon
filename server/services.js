import { randomUUID } from "node:crypto";
import { repositories } from "./repositories.js";

export const supportedTopics = [
  {
    id: "arithmetic",
    label: "Arithmetic",
    description: "Whole numbers, fractions, decimals, percentages, and order of operations.",
  },
  {
    id: "basic-algebra",
    label: "Basic algebra",
    description: "Variables, expressions, simple equations, substitution, and patterns.",
  },
];

function normalizeRole(role, username = "") {
  if (role === "teacher" || role === "student") {
    return role;
  }

  return username.toLowerCase().includes("teacher") ? "teacher" : "student";
}

function emptyDashboard(role) {
  if (role === "teacher") {
    return {
      stats: [],
      focus: null,
      chartData: [],
      activity: [],
      classes: [],
      assignments: [],
      analytics: [],
    };
  }

  return {
    stats: [],
    focus: null,
    chartData: [],
    activity: [],
    assignments: [],
    feedback: [],
    progress: [],
    practice: [],
  };
}

function topicLabel(topicId) {
  return supportedTopics.find((topic) => topic.id === topicId)?.label ?? "Practice";
}

function buildPracticeQuestion(topicId = "arithmetic") {
  if (topicId === "basic-algebra") {
    return {
      id: randomUUID(),
      topicId,
      prompt: "Solve for x: x + 7 = 12",
      expectedAnswer: "5",
      hint: "Subtract 7 from both sides.",
      visualLabel: "Equation balance",
    };
  }

  return {
    id: randomUUID(),
    topicId: "arithmetic",
    prompt: "Calculate: 18 + 27",
    expectedAnswer: "45",
    hint: "Add the ones, then add the tens.",
    visualLabel: "Number work",
  };
}

function normalizeAnswer(value) {
  return String(value ?? "").trim().toLowerCase();
}

export async function authenticateUser(credentials) {
  const username = String(credentials.username || "").trim();
  const password = String(credentials.password || "");

  if (!username || !password) {
    return { granted: false, reason: "Username and password are required." };
  }

  const users = await repositories.users.all();
  const existingUser = users.find((user) => user.username === username);
  const role = normalizeRole(existingUser?.role ?? credentials.role, username);
  const session = await repositories.sessions.insert({
    token: randomUUID(),
    username,
    role,
  });

  return {
    granted: true,
    token: session.token,
    user: {
      username,
      role,
    },
  };
}

export async function requestVerification(payload) {
  const username = String(payload.username || "").trim();
  const email = String(payload.email || "").trim();
  const role = normalizeRole(payload.role, username);

  if (!username || !email) {
    return { accepted: false, reason: "Username and email are required." };
  }

  return {
    accepted: true,
    verificationId: randomUUID(),
    user: { username, email, role },
  };
}

export async function verifyUser(payload) {
  if (payload.code !== "123456") {
    return { verified: false, reason: "Invalid verification code." };
  }

  const username = String(payload.username || "").trim();
  const email = String(payload.email || "").trim();
  const role = normalizeRole(payload.role, username);

  if (!username || !email) {
    return { verified: false, reason: "Pending user details are missing." };
  }

  const users = await repositories.users.all();
  const exists = users.some((user) => user.username === username);

  if (!exists) {
    await repositories.users.insert({ username, email, role });
  }

  return {
    verified: true,
    user: { username, email, role },
  };
}

export async function getDashboard(role, username) {
  const assignments = await getAssignmentsForUser(role, username);
  const classes = role === "teacher" ? await getClassesForTeacher(username) : [];
  const records = await getProgress(username);

  return {
    role,
    username,
    topics: supportedTopics,
    ...emptyDashboard(role),
    activity: records.slice(-5).reverse(),
    assignments,
    classes,
    stats:
      role === "teacher"
        ? [
            { label: "Classes", value: String(classes.length), detail: "created" },
            { label: "Assignments", value: String(assignments.length), detail: "created" },
            { label: "Results", value: String(records.length), detail: "submitted" },
          ]
        : [
            { label: "Assignments", value: String(assignments.length), detail: "available" },
            { label: "Answered", value: String(records.length), detail: "questions" },
            {
              label: "Correct",
              value: String(records.filter((record) => record.result === "correct").length),
              detail: "answers",
            },
          ],
  };
}

export async function getTopics() {
  return supportedTopics;
}

function normalizeTopicIds(topicIds = []) {
  const allowedTopicIds = new Set(supportedTopics.map((topic) => topic.id));

  return topicIds.filter((topicId) => allowedTopicIds.has(topicId));
}

export async function getAssignmentsForUser(role, username) {
  const assignments = await repositories.assignments.all();

  return assignments.filter((assignment) => {
    if (role === "teacher") {
      return assignment.teacherUsername === username;
    }

    return (
      !assignment.studentUsernames?.length ||
      assignment.studentUsernames.includes(username)
    );
  });
}

export async function createAssignment(payload) {
  return repositories.assignments.insert({
    classId: payload.classId ?? "",
    title: payload.title ?? "",
    instructions: payload.instructions ?? "",
    teacherUsername: payload.teacherUsername ?? "",
    studentUsernames: payload.studentUsernames ?? [],
    topicIds: normalizeTopicIds(payload.topicIds),
    questionIds: payload.questionIds ?? [],
  });
}

export async function getClassesForTeacher(username) {
  const classes = await repositories.classes.all();
  return classes.filter((classRecord) => classRecord.teacherUsername === username);
}

export async function createClass(payload) {
  return repositories.classes.insert({
    name: payload.name ?? "",
    yearGroup: payload.yearGroup ?? "",
    subject: payload.subject ?? "",
    inviteCode: payload.inviteCode ?? randomUUID().slice(0, 6).toUpperCase(),
    teacherUsername: payload.teacherUsername ?? "",
    studentUsernames: payload.studentUsernames ?? [],
  });
}

export async function getQuestionDelivery(username, assignmentId) {
  const assignments = await repositories.assignments.all();
  const questions = await repositories.questions.all();
  const assignment = assignments.find((item) => item.id === assignmentId);

  if (!assignment) {
    return { assignment: null, questions: [] };
  }

  return {
    assignment,
    questions: questions.filter((question) =>
      assignment.questionIds?.includes(question.id)
    ),
    username,
  };
}

export async function getPracticeQuestion(topicId) {
  return buildPracticeQuestion(topicId);
}

export async function checkAnswer(payload) {
  const expectedAnswer = payload.expectedAnswer ?? "";
  const result =
    normalizeAnswer(payload.answer) === normalizeAnswer(expectedAnswer)
      ? "correct"
      : "incorrect";
  const topicId = payload.topicId ?? "arithmetic";
  const record = await repositories.studentRecords.insert({
    username: payload.username ?? "",
    assignmentId: payload.assignmentId ?? "",
    questionId: payload.questionId ?? "",
    topicId,
    prompt: payload.prompt ?? "",
    answer: payload.answer ?? "",
    expectedAnswer,
    result,
  });

  return {
    result: record.result,
    feedback:
      result === "correct"
        ? `Correct. ${topicLabel(topicId)} practice saved.`
        : payload.hint || "Try the inverse operation and check each step.",
    record,
  };
}

export async function getProgress(username) {
  const records = await repositories.studentRecords.all();
  return records.filter((record) => record.username === username);
}

export async function getFeedback(username) {
  const records = await repositories.studentRecords.all();
  const feedbackLibrary = await repositories.feedbackLibrary.all();

  return {
    records: records.filter((record) => record.username === username),
    hints: feedbackLibrary,
  };
}
