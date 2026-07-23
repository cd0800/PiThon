const apiBaseUrl = "/api";

// Shared API wrapper: attaches the current session token and normalizes errors.
async function request(path, options = {}) {
  let response;
  const token =
    window.sessionStorage.getItem("pithonAuthToken") ||
    window.localStorage.getItem("pithonAuthToken");

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error("The backend is not running. Start npm run backend.");
  }

  if (!response.ok) {
    let detail = "";

    try {
      const payload = await response.json();
      detail = payload.detail || payload.error || payload.reason || "";
    } catch {
      detail = "";
    }

    // A rejected token should force the next screen to authenticate cleanly.
    if (response.status === 401) {
      window.localStorage.removeItem("pithonAuthToken");
      window.localStorage.removeItem("pithonCurrentRole");
      window.localStorage.removeItem("pithonCurrentUsername");
      window.sessionStorage.removeItem("pithonAuthToken");
    }

    throw new Error(
      detail || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}

// Auth endpoints.
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

// Dashboard data endpoints.
export function getDashboardData(role, username) {
  return request(`/dashboard/${role}/${encodeURIComponent(username)}`);
}

export function getTopics() {
  return request("/topics");
}

// Teacher-created assignment records and results.
export function getAssignments(role, username) {
  return request(`/assignments/${role}/${encodeURIComponent(username)}`);
}

export function createAssignment(payload) {
  return request("/assignments", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function updateAssignment(assignmentId, payload) {
  return request(`/assignments/${encodeURIComponent(assignmentId)}`, {
    body: JSON.stringify(payload),
    method: "PUT",
  });
}

export function getAssignmentResults(assignmentId) {
  return request(`/assignments/${encodeURIComponent(assignmentId)}/results`);
}

// Class membership and scoreboard endpoints.
export function getClasses(username) {
  return request(`/classes/${encodeURIComponent(username)}`);
}

export function createClass(payload) {
  return request("/classes", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getStudentClasses(username) {
  return request(`/student-classes/${encodeURIComponent(username)}`);
}

export function getClassScoreboard(classId) {
  return request(`/scoreboard/${encodeURIComponent(classId)}`);
}

export function joinClass(payload) {
  return request("/classes/join", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

// Student progress, feedback, and question endpoints.
export function getProgress(username) {
  return request(`/progress/${encodeURIComponent(username)}`);
}

export function getFeedback(username) {
  return request(`/feedback/${encodeURIComponent(username)}`);
}

export function getTeacherAnalytics(username) {
  return request(`/analytics/${encodeURIComponent(username)}`);
}

export function getNotifications(username) {
  return request(`/notifications/${encodeURIComponent(username)}`);
}

export function getQuestionDelivery(username, assignmentId) {
  const params = new URLSearchParams({ username, assignmentId });
  return request(`/questions/delivery?${params.toString()}`);
}

export function getPracticeQuestion(topicId, username) {
  const params = new URLSearchParams({ topicId, username });
  return request(`/questions/practice?${params.toString()}`);
}

export function checkAnswer(payload) {
  return request("/answers/check", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}
