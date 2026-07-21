const apiBaseUrl = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export function loginUser(credentials) {
  return request("/auth/login", {
    body: JSON.stringify(credentials),
    method: "POST",
  });
}

export function requestEmailVerification(payload) {
  return request("/auth/request-verification", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function verifyEmailCode(payload) {
  return request("/auth/verify", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getDashboardData(role, username) {
  return request(`/dashboard/${role}/${encodeURIComponent(username)}`);
}

export function getTopics() {
  return request("/topics");
}

export function getAssignments(role, username) {
  return request(`/assignments/${role}/${encodeURIComponent(username)}`);
}

export function createAssignment(payload) {
  return request("/assignments", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getClasses(username) {
  return request(`/classes/${encodeURIComponent(username)}`);
}

export function createClass(payload) {
  return request("/classes", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getProgress(username) {
  return request(`/progress/${encodeURIComponent(username)}`);
}

export function getFeedback(username) {
  return request(`/feedback/${encodeURIComponent(username)}`);
}

export function getQuestionDelivery(username, assignmentId) {
  const params = new URLSearchParams({ username, assignmentId });
  return request(`/questions/delivery?${params.toString()}`);
}

export function getPracticeQuestion(topicId) {
  const params = new URLSearchParams({ topicId });
  return request(`/questions/practice?${params.toString()}`);
}

export function checkAnswer(payload) {
  return request("/answers/check", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}
