import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  authenticateUser,
  checkAnswer,
  createAssignment,
  createClass,
  getAssignmentResults,
  getClassScoreboard,
  getNotifications,
  getAssignmentsForUser,
  getClassesForTeacher,
  getClassesForStudent,
  getDashboard,
  getFeedback,
  getPracticeQuestion,
  getProgress,
  getQuestionDelivery,
  getTeacherAnalytics,
  getTopics,
  joinClass,
  requestVerification,
  updateAssignment,
  validateSession,
  verifyUser,
} from "./services.js";

const port = Number(process.env.PORT || 4174);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const maxJsonBytes = 100_000;
const allowedOrigin = process.env.PITHON_ALLOWED_ORIGIN || "";
const rateLimitWindowMs = 60_000;
const rateLimits = new Map();
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// Browser-facing security headers are centralized so API and static responses match.
function getSecurityHeaders(request) {
  const origin = request.headers.origin || "";
  const corsOrigin = allowedOrigin
    ? origin === allowedOrigin
      ? allowedOrigin
      : "null"
    : origin || "http://127.0.0.1:5173";

  return {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Origin": corsOrigin,
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http://127.0.0.1:4174 http://127.0.0.1:5173",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

function sendError(request, response, status, message) {
  response.writeHead(status, {
    ...getSecurityHeaders(request),
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify({ error: message }));
}

function sendSecureJson(request, response, status, payload) {
  response.writeHead(status, {
    ...getSecurityHeaders(request),
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  if (
    ["POST", "PUT"].includes(request.method) &&
    !String(request.headers["content-type"] || "").includes("application/json")
  ) {
    throw new Error("Expected application/json.");
  }

  for await (const chunk of request) {
    size += chunk.length;

    if (size > maxJsonBytes) {
      throw new Error("Request body is too large.");
    }

    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");

  if (!body) {
    return {};
  }

  return JSON.parse(body);
}

function getRoute(request) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  return { parts, searchParams: url.searchParams };
}

// Production builds can be served by the same Node process as the API.
function serveStatic(request, response) {
  if (!existsSync(distDir)) {
    return false;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const targetPath = path.normalize(
    path.join(distDir, requestedPath === "/" ? "index.html" : requestedPath)
  );
  const filePath = targetPath.startsWith(distDir) && existsSync(targetPath)
    ? targetPath
    : path.join(distDir, "index.html");

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return false;
  }

  response.writeHead(200, {
    ...getSecurityHeaders(request),
    "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
  return true;
}

function getClientKey(request) {
  return `${request.socket.remoteAddress || "local"}:${request.url}`;
}

function isRateLimited(request) {
  if (!request.url.startsWith("/api")) {
    return false;
  }

  const key = getClientKey(request);
  const now = Date.now();
  const limit = request.url.startsWith("/api/auth") ? 8 : 120;
  const current = rateLimits.get(key) || { count: 0, resetAt: now + rateLimitWindowMs };

  if (current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  current.count += 1;
  rateLimits.set(key, current);

  return current.count > limit;
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

// All protected routes resolve ownership from the token, not browser-sent usernames.
async function requireSession(request, response, expected = {}) {
  const session = await validateSession(getBearerToken(request));

  if (!session) {
    sendSecureJson(request, response, 401, { error: "Authentication required." });
    return null;
  }

  if (expected.role && session.role !== expected.role) {
    sendSecureJson(request, response, 403, {
      error: `Access denied. You are signed in as a ${session.role}, but this action needs a ${expected.role} account.`,
    });
    return null;
  }

  if (expected.username && session.username !== expected.username) {
    sendSecureJson(request, response, 403, {
      error: "Access denied. Your browser account details do not match your current session.",
    });
    return null;
  }

  return session;
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    sendSecureJson(request, response, 204, {});
    return;
  }

  const { parts, searchParams } = getRoute(request);

  if (request.method === "GET" && parts.join("/") === "api/health") {
    sendSecureJson(request, response, 200, {
      ok: true,
      systems: [
        "user database",
        "assignment records",
        "question database",
        "student records",
        "feedback library",
      ],
    });
    return;
  }

  // Auth and bootstrap routes.
  if (request.method === "GET" && parts.join("/") === "api/topics") {
    sendSecureJson(request, response, 200, await getTopics());
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/auth/login") {
    sendSecureJson(request, response, 200, await authenticateUser(await readJson(request)));
    return;
  }

  // Role dashboards and assignment management.
  if (
    request.method === "POST" &&
    parts.join("/") === "api/auth/request-verification"
  ) {
    sendSecureJson(request, response, 200, await requestVerification(await readJson(request)));
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/auth/verify") {
    sendSecureJson(request, response, 200, await verifyUser(await readJson(request)));
    return;
  }

  // Class membership and class scoreboards.
  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "dashboard" &&
    parts.length === 4
  ) {
    const session = await requireSession(request, response, { role: parts[2] });
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      200,
      await getDashboard(session.role, session.username)
    );
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "assignments" &&
    parts.length === 4 &&
    parts[3] !== "results"
  ) {
    const session = await requireSession(request, response, { role: parts[2] });
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      200,
      await getAssignmentsForUser(session.role, session.username)
    );
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/assignments") {
    const payload = await readJson(request);
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      201,
      await createAssignment({ ...payload, teacherUsername: session.username })
    );
    return;
  }

  if (
    request.method === "PUT" &&
    parts[0] === "api" &&
    parts[1] === "assignments" &&
    parts.length === 3
  ) {
    const payload = await readJson(request);
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    const result = await updateAssignment(parts[2], {
      ...payload,
      teacherUsername: session.username,
    });
    const status = result.accessDenied ? 403 : result.updated ? 200 : 404;
    sendSecureJson(request, response, status, result);
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "assignments" &&
    parts[3] === "results" &&
    parts.length === 4
  ) {
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    const result = await getAssignmentResults(parts[2], session);
    const status = result.allowed === false ? 403 : result.found === false ? 404 : 200;
    sendSecureJson(request, response, status, result);
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "classes" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getClassesForTeacher(session.username));
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/classes") {
    const payload = await readJson(request);
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      201,
      await createClass({ ...payload, teacherUsername: session.username })
    );
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/classes/join") {
    const payload = await readJson(request);
    const session = await requireSession(request, response, { role: "student" });
    if (!session) {
      return;
    }
    const result = await joinClass({ ...payload, username: session.username });
    sendSecureJson(request, response, result.joined ? 200 : 404, result);
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "student-classes" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response, { role: "student" });
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getClassesForStudent(session.username));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "scoreboard" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response);
    if (!session) {
      return;
    }
    const result = await getClassScoreboard(parts[2], session);
    const status = result.allowed === false ? 403 : result.found === false ? 404 : 200;
    sendSecureJson(request, response, status, result);
    return;
  }

  // Question delivery separates finite assignments from infinite practice.
  if (request.method === "GET" && parts.join("/") === "api/questions/delivery") {
    const session = await requireSession(request, response);
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      200,
      await getQuestionDelivery(
        session.username,
        searchParams.get("assignmentId") || ""
      )
    );
    return;
  }

  if (request.method === "GET" && parts.join("/") === "api/questions/practice") {
    const session = await requireSession(request, response);
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      200,
      await getPracticeQuestion(searchParams.get("topicId") || "", session.username)
    );
    return;
  }

  // Student records feed progress, feedback, scoreboards, and teacher results.
  if (request.method === "POST" && parts.join("/") === "api/answers/check") {
    const payload = await readJson(request);
    const session = await requireSession(request, response, { role: "student" });
    if (!session) {
      return;
    }
    sendSecureJson(
      request,
      response,
      200,
      await checkAnswer({ ...payload, username: session.username })
    );
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "progress" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response, { role: "student" });
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getProgress(session.username));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "feedback" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response, { role: "student" });
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getFeedback(session.username));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "analytics" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response, { role: "teacher" });
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getTeacherAnalytics(session.username));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "notifications" &&
    parts.length === 3
  ) {
    const session = await requireSession(request, response);
    if (!session) {
      return;
    }
    sendSecureJson(request, response, 200, await getNotifications(session.username));
    return;
  }

  sendSecureJson(request, response, 404, { error: "Not found" });
}

const server = http.createServer((request, response) => {
  if (isRateLimited(request)) {
    sendError(request, response, 429, "Too many requests.");
    return;
  }

  if (!request.url.startsWith("/api") && serveStatic(request, response)) {
    return;
  }

  handleRequest(request, response).catch((error) => {
    const badRequestMessages = new Set([
      "Expected application/json.",
      "Request body is too large.",
    ]);
    const status = badRequestMessages.has(error.message) ? 400 : 500;
    const message =
      status === 400 || process.env.NODE_ENV !== "production"
        ? error.message
        : "Internal server error.";

    sendError(request, response, status, message);
  });
});

server.listen(port, () => {
  console.log(`PiThon API listening on http://127.0.0.1:${port}`);
});
