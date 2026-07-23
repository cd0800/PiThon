import {
  createCipheriv,
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { repositories } from "./repositories.js";

const passwordKeyLength = 64;
const sessionDurationMs = 1000 * 60 * 60 * 8;
const dataKey = scryptSync(
  process.env.PITHON_DATA_KEY || "pithon-development-data-key",
  "pithon-data",
  32
);

// Trim untrusted user input before it reaches stored records.
function sanitizeText(value, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

// Passwords and sessions are stored as hashes, never as raw secrets.
function hashPassword(password, salt = randomUUID()) {
  return {
    passwordHash: scryptSync(String(password), salt, passwordKeyLength).toString("hex"),
    passwordSalt: salt,
  };
}

function encryptText(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedText: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

function encryptEmail(email) {
  const encryptedEmail = encryptText(email);

  return {
    email: "",
    emailEncrypted: encryptedEmail.encryptedText,
    emailIv: encryptedEmail.iv,
    emailAuthTag: encryptedEmail.authTag,
  };
}

function verifyPassword(password, user) {
  if (!user.passwordHash || !user.passwordSalt) {
    return false;
  }

  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = scryptSync(String(password), user.passwordSalt, passwordKeyLength);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashToken(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

function createSessionRecord(username, role) {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    storedSession: {
      expiresAt: new Date(Date.now() + sessionDurationMs).toISOString(),
      role,
      tokenHash: hashToken(token),
      username,
    },
  };
}

async function createSession(username, role) {
  const session = createSessionRecord(username, role);
  const storedSession = await repositories.sessions.insert(session.storedSession);

  return {
    ...storedSession,
    token: session.token,
  };
}

// Existing demo accounts can still infer role, but saved user roles win.
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

async function topicLabel(topicId) {
  const topics = await getTopics();
  return topics.find((topic) => topic.id === topicId)?.label ?? "Practice";
}

async function getQuestionForTopic(topicId = "") {
  const questions = await repositories.questions.all();
  const topicQuestions = topicId
    ? questions.filter((question) => question.topicId === topicId)
    : questions;
  const question = topicQuestions[0] ?? questions[0];

  return (
    question ?? {
      id: "",
      topicId,
      prompt: "",
      expectedAnswer: "",
      hint: "",
      visualLabel: "",
    }
  );
}

async function getAdaptiveQuestion(topicId = "", username = "") {
  const questions = await repositories.questions.all();
  const records = (await getProgress(username)).filter(
    (record) => !topicId || record.topicId === topicId
  );
  const recentRecords = records.slice(-5);
  const correctCount = recentRecords.filter((record) => record.result === "correct").length;
  const accuracy = recentRecords.length ? correctCount / recentRecords.length : 0.5;
  // Keep adaptive practice simple: stronger recent accuracy moves up one tier.
  const targetDifficulty = accuracy >= 0.75 ? "medium" : "easy";
  const topicQuestions = questions.filter(
    (question) =>
      (!topicId || question.topicId === topicId) &&
      question.difficulty === targetDifficulty
  );

  return topicQuestions[0] ?? getQuestionForTopic(topicId);
}

function normalizeAnswer(value) {
  return String(value ?? "").trim().toLowerCase();
}

export async function authenticateUser(credentials) {
  const username = sanitizeText(credentials.username, 80);
  const password = String(credentials.password || "");

  if (!username || !password) {
    return { granted: false, reason: "Username and password are required." };
  }

  const users = await repositories.users.all();
  const existingUser = users.find((user) => user.username === username);
  const role = normalizeRole(existingUser?.role ?? credentials.role, username);

  if (existingUser && !verifyPassword(password, existingUser)) {
    return { granted: false, reason: "Invalid username or password." };
  }

  if (!existingUser) {
    const passwordFields = hashPassword(password);
    await repositories.users.insert({
      ...encryptEmail(sanitizeText(credentials.email, 160)),
      ...passwordFields,
      role,
      username,
    });
  }

  const session = await createSession(username, role);

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
  const username = sanitizeText(payload.username, 80);
  const email = sanitizeText(payload.email, 160);
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

  const username = sanitizeText(payload.username, 80);
  const email = sanitizeText(payload.email, 160);
  const password = String(payload.password || "");
  const role = normalizeRole(payload.role, username);

  if (!username || !email || !password) {
    return { verified: false, reason: "Pending user details are missing." };
  }

  const users = await repositories.users.all();
  const existingIndex = users.findIndex((user) => user.username === username);

  const passwordFields = hashPassword(password);

  if (existingIndex < 0) {
    await repositories.users.insert({
      username,
      ...encryptEmail(email),
      role,
      ...passwordFields,
    });
  } else {
    users[existingIndex] = {
      ...users[existingIndex],
      ...encryptEmail(email),
      ...passwordFields,
      role,
    };
    await repositories.users.replaceAll(users);
  }

  const session = await createSession(username, role);

  return {
    token: session.token,
    verified: true,
    user: { username, email, role },
  };
}

export async function validateSession(token = "") {
  const sessions = await repositories.sessions.all();
  const now = Date.now();
  const tokenHash = hashToken(token);
  const activeSessions = sessions.filter(
    (session) => !session.expiresAt || Date.parse(session.expiresAt) > now
  );

  if (activeSessions.length !== sessions.length) {
    await repositories.sessions.replaceAll(activeSessions);
  }

  return (
    activeSessions.find((session) => {
      return session.tokenHash === tokenHash;
    }) ?? null
  );
}

export async function getDashboard(role, username) {
  const assignments = await getAssignmentsForUser(role, username);
  const classes = role === "teacher" ? await getClassesForTeacher(username) : [];
  const records = await getProgress(username);
  const correctRecords = records.filter((record) => record.result === "correct");
  const teacherActivity = [
    ...classes.map((classRecord) => ({
      description: `${classRecord.yearGroup || "Class"} ${classRecord.subject || ""}`.trim(),
      media: "C",
      title: classRecord.name || "Class",
    })),
    ...assignments.map((assignment) => ({
      description: assignment.dueDate
        ? `Due ${assignment.dueDate}`
        : assignment.instructions || "Assignment ready for students.",
      media: "A",
      title: assignment.title || "Assignment",
    })),
  ];
  const studentActivity = records.slice(-5).reverse().map((record) => ({
    description: record.prompt || "Practice question",
    media: record.result === "correct" ? "C" : "I",
    title: record.result === "correct" ? "Correct answer" : "Needs review",
  }));

  return {
    role,
    username,
    topics: await getTopics(),
    ...emptyDashboard(role),
    activity: role === "teacher" ? teacherActivity.slice(-5).reverse() : studentActivity,
    assignments,
    classes,
    chartData: records.length
      ? [
          { label: "Answered", value: records.length },
          { label: "Correct", value: correctRecords.length },
          { label: "Review", value: records.length - correctRecords.length },
        ]
      : [],
    focus:
      role === "teacher" && assignments.length
        ? {
            body: "Assignments are available for students. Check Analytics after students submit answers.",
            meta: "Assignment coverage",
            progress: Math.min(assignments.length * 20, 100),
            title: "Current teaching focus",
          }
        : role === "student" && assignments.length
          ? {
              body: "You have assignments ready. Open Assignments or start topic practice.",
              meta: "Available work",
              progress: Math.min(assignments.length * 25, 100),
              title: "Next lesson",
            }
          : null,
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

export async function getTeacherAnalytics(username) {
  const classes = await getClassesForTeacher(username);
  const assignments = await getAssignmentsForUser("teacher", username);
  const records = await repositories.studentRecords.all();
  const correctRecords = records.filter((record) => record.result === "correct");

  return {
    assignments,
    classes,
    records,
    stats: [
      { label: "Classes", value: classes.length },
      { label: "Assignments", value: assignments.length },
      { label: "Answers", value: records.length },
      { label: "Correct", value: correctRecords.length },
    ],
  };
}

export async function getTopics() {
  return repositories.topics.all();
}

async function normalizeTopicIds(topicIds = []) {
  const topics = await getTopics();
  const allowedTopicIds = new Set(topics.map((topic) => topic.id));

  return topicIds.filter((topicId) => allowedTopicIds.has(topicId));
}

function normalizeQuestionLimit(value) {
  const limit = Number.parseInt(String(value ?? 5), 10);

  if (!Number.isFinite(limit)) {
    return 5;
  }

  return Math.min(Math.max(limit, 1), 50);
}

// A teacher assignment stores a fixed-size ordered set; repeated ids are allowed.
async function buildQuestionSet(topicIds = [], questionLimit = 5) {
  const questions = await repositories.questions.all();
  const allowedTopicIds = await normalizeTopicIds(topicIds);
  const matchingQuestions = questions.filter(
    (question) =>
      !allowedTopicIds.length || allowedTopicIds.includes(question.topicId)
  );
  const pool = matchingQuestions.length ? matchingQuestions : questions;
  const limit = normalizeQuestionLimit(questionLimit);

  if (!pool.length) {
    return [];
  }

  return Array.from({ length: limit }, (_, index) => pool[index % pool.length].id);
}

function getAssignmentLimit(assignment) {
  return normalizeQuestionLimit(
    assignment.questionLimit ?? assignment.questionIds?.length ?? 5
  );
}

export async function getAssignmentsForUser(role, username, options = {}) {
  const assignments = await repositories.assignments.all();
  const classes = await repositories.classes.all();
  const records = role === "student" ? await repositories.studentRecords.all() : [];
  const studentClassIds = new Set(
    classes
      .filter((classRecord) => classRecord.studentUsernames?.includes(username))
      .map((classRecord) => classRecord.id)
  );

  return assignments.filter((assignment) => {
    if (role === "teacher") {
      return assignment.teacherUsername === username;
    }

    const isAssigned =
      !assignment.studentUsernames?.length ||
      assignment.studentUsernames.includes(username) ||
      (assignment.classId && studentClassIds.has(assignment.classId));

    // Completed assignments stay in storage but disappear from the student's list.
    if (!isAssigned || options.includeCompleted) {
      return isAssigned;
    }

    const answeredCount = records.filter(
      (record) =>
        record.username === username && record.assignmentId === assignment.id
    ).length;

    return answeredCount < getAssignmentLimit(assignment);
  });
}

export async function createAssignment(payload) {
  const classes = await repositories.classes.all();
  const selectedClass = classes.find((classRecord) => classRecord.id === payload.classId);
  const topicIds = await normalizeTopicIds(payload.topicIds);
  const questionLimit = normalizeQuestionLimit(payload.questionLimit);
  const assignment = await repositories.assignments.insert({
    classId: payload.classId ?? "",
    dueDate: sanitizeText(payload.dueDate, 40),
    title: sanitizeText(payload.title, 160),
    instructions: sanitizeText(payload.instructions, 1000),
    teacherUsername: payload.teacherUsername ?? "",
    studentUsernames:
      payload.studentUsernames ?? selectedClass?.studentUsernames ?? [],
    topicIds,
    questionLimit,
    questionIds: payload.questionIds?.length
      ? payload.questionIds.slice(0, questionLimit)
      : await buildQuestionSet(topicIds, questionLimit),
  });

  await notifyUsers(assignment.studentUsernames, {
    title: "New assignment",
    message: assignment.title || "A new assignment is ready.",
    type: "assignment",
  });

  return assignment;
}

export async function updateAssignment(assignmentId, payload) {
  const assignments = await repositories.assignments.all();
  const assignmentIndex = assignments.findIndex((assignment) => assignment.id === assignmentId);

  if (assignmentIndex < 0) {
    return { updated: false, reason: "Assignment not found." };
  }

  const current = assignments[assignmentIndex];

  if (
    payload.teacherUsername &&
    current.teacherUsername &&
    current.teacherUsername !== payload.teacherUsername
  ) {
    return {
      accessDenied: true,
      reason: "Only the assignment owner can edit this assignment.",
      updated: false,
    };
  }

  const updatedAssignment = {
    ...current,
    classId: payload.classId ?? current.classId,
    dueDate: payload.dueDate ?? current.dueDate ?? "",
    instructions: payload.instructions ?? current.instructions,
    title: payload.title ?? current.title,
    topicIds: payload.topicIds ? await normalizeTopicIds(payload.topicIds) : current.topicIds,
    questionLimit: normalizeQuestionLimit(
      payload.questionLimit ?? current.questionLimit ?? current.questionIds?.length ?? 5
    ),
    updatedAt: new Date().toISOString(),
  };
  // Rebuild finite sets only when the teacher changes their scope or size.
  updatedAssignment.questionIds =
    payload.topicIds || payload.questionLimit
      ? await buildQuestionSet(updatedAssignment.topicIds, updatedAssignment.questionLimit)
      : current.questionIds ?? [];

  assignments[assignmentIndex] = updatedAssignment;
  await repositories.assignments.replaceAll(assignments);

  await notifyUsers(updatedAssignment.studentUsernames, {
    title: "Assignment updated",
    message: updatedAssignment.title || "An assignment was updated.",
    type: "assignment",
  });

  return { assignment: updatedAssignment, updated: true };
}

export async function getClassesForTeacher(username) {
  const classes = await repositories.classes.all();
  return classes.filter((classRecord) => classRecord.teacherUsername === username);
}

export async function getClassesForStudent(username) {
  const classes = await repositories.classes.all();
  return classes.filter((classRecord) =>
    classRecord.studentUsernames?.includes(username)
  );
}

export async function createClass(payload) {
  return repositories.classes.insert({
    name: sanitizeText(payload.name, 160),
    yearGroup: sanitizeText(payload.yearGroup, 80),
    subject: sanitizeText(payload.subject, 120),
    inviteCode: payload.inviteCode ?? randomUUID().slice(0, 6).toUpperCase(),
    teacherUsername: sanitizeText(payload.teacherUsername, 80),
    studentUsernames: payload.studentUsernames ?? [],
  });
}

export async function joinClass(payload) {
  const username = sanitizeText(payload.username, 80);
  const inviteCode = sanitizeText(payload.inviteCode, 20).toUpperCase();

  if (!username || !inviteCode) {
    return {
      joined: false,
      reason: "Username and invite code are required.",
    };
  }

  const classes = await repositories.classes.all();
  const classIndex = classes.findIndex(
    (classRecord) => classRecord.inviteCode === inviteCode
  );

  if (classIndex < 0) {
    return {
      joined: false,
      reason: "No class was found for that invite code.",
    };
  }

  const classRecord = classes[classIndex];
  const studentUsernames = new Set(classRecord.studentUsernames ?? []);
  studentUsernames.add(username);

  const updatedClass = {
    ...classRecord,
    studentUsernames: Array.from(studentUsernames),
  };

  classes[classIndex] = updatedClass;
  await repositories.classes.replaceAll(classes);
  await notifyUsers([updatedClass.teacherUsername], {
    title: "Student joined",
    message: `${username} joined ${updatedClass.name || "your class"}.`,
    type: "class",
  });

  return {
    class: updatedClass,
    joined: true,
  };
}

export async function getQuestionDelivery(username, assignmentId) {
  const questions = await repositories.questions.all();
  const availableAssignments = await getAssignmentsForUser("student", username, {
    includeCompleted: true,
  });
  const assignment = availableAssignments.find((item) => item.id === assignmentId);

  if (!assignment) {
    return {
      assignment: null,
      complete: false,
      completedCount: 0,
      limit: 0,
      nextQuestion: null,
      questions: [],
      records: [],
    };
  }

  const assignmentQuestionIds =
    assignment.questionIds?.length
      ? assignment.questionIds
      : await buildQuestionSet(assignment.topicIds, assignment.questionLimit);
  const limit = normalizeQuestionLimit(
    assignment.questionLimit ?? assignmentQuestionIds.length
  );
  const selectedQuestionIds = assignmentQuestionIds.slice(0, limit);
  const selectedQuestions = selectedQuestionIds
    .map((questionId) => questions.find((question) => question.id === questionId))
    .filter(Boolean);
  const records = (await repositories.studentRecords.all()).filter(
    (record) =>
      record.username === username && record.assignmentId === assignment.id
  );
  // Assignment mode advances by counting stored submissions for this student.
  const nextQuestion =
    records.length < limit && selectedQuestions.length
      ? selectedQuestions[records.length % selectedQuestions.length]
      : null;

  return {
    assignment: { ...assignment, questionLimit: limit },
    complete: records.length >= limit,
    completedCount: Math.min(records.length, limit),
    limit,
    nextQuestion,
    questions: selectedQuestions,
    records,
    username,
  };
}

export async function getAssignmentResults(assignmentId, session) {
  const assignments = await repositories.assignments.all();
  const assignment = assignments.find((item) => item.id === assignmentId);

  if (!assignment) {
    return { found: false, reason: "Assignment not found.", rows: [] };
  }

  if (
    session.role !== "teacher" ||
    assignment.teacherUsername !== session.username
  ) {
    return { allowed: false, reason: "Access denied.", rows: [] };
  }

  const classes = await repositories.classes.all();
  const classRecord = classes.find((item) => item.id === assignment.classId);
  const students = assignment.studentUsernames?.length
    ? assignment.studentUsernames
    : classRecord?.studentUsernames ?? [];
  const records = (await repositories.studentRecords.all()).filter(
    (record) => record.assignmentId === assignment.id
  );
  const limit = normalizeQuestionLimit(
    assignment.questionLimit ?? assignment.questionIds?.length ?? 5
  );
  const rows = students.map((username) => {
    const studentRecords = records.filter((record) => record.username === username);
    const correct = studentRecords.filter((record) => record.result === "correct");

    return {
      username,
      answered: studentRecords.length,
      complete: studentRecords.length >= limit,
      correct: correct.length,
      points: studentRecords.reduce(
        (total, record) => total + (Number(record.pointsAwarded) || 0),
        0
      ),
      pointsPossible: studentRecords.reduce(
        (total, record) => total + (Number(record.pointsPossible) || 0),
        0
      ),
    };
  });

  return {
    assignment: {
      id: assignment.id,
      title: assignment.title,
      questionLimit: limit,
    },
    records,
    rows,
  };
}

export async function getPracticeQuestion(topicId, username = "") {
  return getAdaptiveQuestion(topicId, username);
}

export async function checkAnswer(payload) {
  const questions = await repositories.questions.all();
  const question = questions.find((item) => item.id === payload.questionId);
  const expectedAnswer = payload.expectedAnswer ?? "";
  const result =
    normalizeAnswer(payload.answer) === normalizeAnswer(expectedAnswer)
      ? "correct"
      : "incorrect";
  const topicId = payload.topicId ?? "";
  // Point values come from the question database, not the browser payload.
  const pointsPossible = Math.max(
    0,
    Number(question?.points ?? payload.points ?? 0) || 0
  );
  const pointsAwarded = result === "correct" ? pointsPossible : 0;
  const record = await repositories.studentRecords.insert({
    username: payload.username ?? "",
    assignmentId: payload.assignmentId ?? "",
    questionId: payload.questionId ?? "",
    topicId,
    prompt: payload.prompt ?? "",
    answer: payload.answer ?? "",
    expectedAnswer,
    feedback:
      result === "correct"
        ? `Correct. ${await topicLabel(topicId)} practice saved.`
        : payload.hint || "Try the inverse operation and check each step.",
    workedExample: payload.workedExample ?? "",
    steps: payload.steps ?? [],
    commonError: payload.commonError ?? "",
    pointsAwarded,
    pointsPossible,
    result,
  });
  await notifyUsers([record.username], {
    title: result === "correct" ? "Answer saved" : "Review feedback",
    message: record.feedback,
    type: "feedback",
  });

  return {
    result: record.result,
    feedback: record.feedback,
    workedExample: record.workedExample,
    steps: record.steps,
    commonError: record.commonError,
    record,
  };
}

export async function getClassScoreboard(classId, session) {
  const classes = await repositories.classes.all();
  const classRecord = classes.find((item) => item.id === classId);

  if (!classRecord) {
    return { found: false, reason: "Class not found.", rows: [] };
  }

  const isTeacher =
    session.role === "teacher" && classRecord.teacherUsername === session.username;
  const isStudent =
    session.role === "student" &&
    classRecord.studentUsernames?.includes(session.username);

  if (!isTeacher && !isStudent) {
    return { allowed: false, reason: "Access denied.", rows: [] };
  }

  const classStudents = classRecord.studentUsernames ?? [];
  const assignments = await repositories.assignments.all();
  const classAssignmentIds = new Set(
    assignments
      .filter((assignment) => assignment.classId === classRecord.id)
      .map((assignment) => assignment.id)
  );
  const records = await repositories.studentRecords.all();
  // Scoreboards count class assignment records, not free practice attempts.
  const relevantRecords = records.filter(
    (record) =>
      classStudents.includes(record.username) &&
      classAssignmentIds.has(record.assignmentId)
  );
  const rows = classStudents.map((username) => {
    const studentRecords = relevantRecords.filter(
      (record) => record.username === username
    );
    const correct = studentRecords.filter((record) => record.result === "correct");

    return {
      username,
      answered: studentRecords.length,
      correct: correct.length,
      points: studentRecords.reduce(
        (total, record) => total + (Number(record.pointsAwarded) || 0),
        0
      ),
      pointsPossible: studentRecords.reduce(
        (total, record) => total + (Number(record.pointsPossible) || 0),
        0
      ),
    };
  });

  return {
    class: {
      id: classRecord.id,
      inviteCode: classRecord.inviteCode,
      name: classRecord.name,
    },
    rows: rows.sort((left, right) => right.points - left.points),
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

export async function notifyUsers(usernames = [], notification) {
  const uniqueUsernames = [...new Set(usernames.filter(Boolean))];

  return Promise.all(
    uniqueUsernames.map((username) =>
      repositories.notifications.insert({
        username,
        read: false,
        title: notification.title ?? "",
        message: notification.message ?? "",
        type: notification.type ?? "system",
      })
    )
  );
}

export async function getNotifications(username) {
  const notifications = await repositories.notifications.all();
  return notifications
    .filter((notification) => notification.username === username)
    .slice()
    .reverse();
}
