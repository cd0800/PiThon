import http from "node:http";
import {
  authenticateUser,
  checkAnswer,
  createAssignment,
  createClass,
  getAssignmentsForUser,
  getClassesForTeacher,
  getDashboard,
  getFeedback,
  getPracticeQuestion,
  getProgress,
  getQuestionDelivery,
  getTopics,
  requestVerification,
  verifyUser,
} from "./services.js";

const port = Number(process.env.PORT || 4174);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
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

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const { parts, searchParams } = getRoute(request);

  if (request.method === "GET" && parts.join("/") === "api/health") {
    sendJson(response, 200, {
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

  if (request.method === "GET" && parts.join("/") === "api/topics") {
    sendJson(response, 200, await getTopics());
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/auth/login") {
    sendJson(response, 200, await authenticateUser(await readJson(request)));
    return;
  }

  if (
    request.method === "POST" &&
    parts.join("/") === "api/auth/request-verification"
  ) {
    sendJson(response, 200, await requestVerification(await readJson(request)));
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/auth/verify") {
    sendJson(response, 200, await verifyUser(await readJson(request)));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "dashboard" &&
    parts.length === 4
  ) {
    sendJson(response, 200, await getDashboard(parts[2], parts[3]));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "assignments" &&
    parts.length === 4
  ) {
    sendJson(response, 200, await getAssignmentsForUser(parts[2], parts[3]));
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/assignments") {
    sendJson(response, 201, await createAssignment(await readJson(request)));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "classes" &&
    parts.length === 3
  ) {
    sendJson(response, 200, await getClassesForTeacher(parts[2]));
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/classes") {
    sendJson(response, 201, await createClass(await readJson(request)));
    return;
  }

  if (request.method === "GET" && parts.join("/") === "api/questions/delivery") {
    sendJson(
      response,
      200,
      await getQuestionDelivery(
        searchParams.get("username") || "",
        searchParams.get("assignmentId") || ""
      )
    );
    return;
  }

  if (request.method === "GET" && parts.join("/") === "api/questions/practice") {
    sendJson(
      response,
      200,
      await getPracticeQuestion(searchParams.get("topicId") || "arithmetic")
    );
    return;
  }

  if (request.method === "POST" && parts.join("/") === "api/answers/check") {
    sendJson(response, 200, await checkAnswer(await readJson(request)));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "progress" &&
    parts.length === 3
  ) {
    sendJson(response, 200, await getProgress(parts[2]));
    return;
  }

  if (
    request.method === "GET" &&
    parts[0] === "api" &&
    parts[1] === "feedback" &&
    parts.length === 3
  ) {
    sendJson(response, 200, await getFeedback(parts[2]));
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    sendJson(response, 500, {
      error: "Internal server error",
      detail: error.message,
    });
  });
});

server.listen(port, () => {
  console.log(`PiThon API listening on http://127.0.0.1:${port}`);
});
