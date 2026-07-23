import { useEffect, useState } from "react";
import "./App.css";
import "./components/ui.css";
import {
  Badge,
  Button,
  Card,
  Chart,
  Empty,
  Item,
  LogoMark,
  NavigationMenu,
  Progress,
  Separator,
  Sidebar,
} from "./components/ui/index.js";
import {
  EmailVerification,
  Login,
  PasswordReset,
  SignUp,
} from "./components/auth/index.js";
import {
  checkAnswer,
  createAssignment,
  createClass,
  getAssignmentResults,
  getAssignments,
  getClassScoreboard,
  getClasses,
  getDashboardData,
  getFeedback,
  getNotifications,
  getPracticeQuestion,
  getProgress,
  getQuestionDelivery,
  getStudentClasses,
  getTeacherAnalytics,
  getTopics,
  joinClass,
  updateAssignment,
} from "./services/api.js";

const navItems = [
  { label: "Home", href: "#/" },
  { label: "About", href: "#/about" },
  { label: "Contact", href: "#/contact" },
  { label: "Help", href: "#/help" },
];

const lessonSteps = [
  "Try a focused challenge",
  "Get immediate feedback",
  "Review progress together",
];

const helpTopics = [
  {
    title: "Getting started",
    body: "Set up a class, invite learners, and choose the first practice path.",
  },
  {
    title: "Teacher dashboard",
    body: "Read effort, accuracy, and confidence signals without hunting through tabs.",
  },
  {
    title: "Student support",
    body: "Find hints, reset work, and keep practice moving when someone gets stuck.",
  },
];

const dashboardNav = {
  teacher: [
    { label: "Home", icon: "H", href: "#/teacher" },
    { label: "Profile", icon: "P", href: "#/teacher/profile" },
    { label: "Classes", icon: "C", href: "#/teacher/classes" },
    { label: "Assignments", icon: "A", href: "#/teacher/assignments" },
    { label: "Analytics", icon: "G", href: "#/teacher/analytics" },
  ],
  student: [
    { label: "Home", icon: "H", href: "#/student" },
    { label: "Profile", icon: "P", href: "#/student/profile" },
    { label: "Classes", icon: "C", href: "#/student/classes" },
    { label: "Assignments", icon: "A", href: "#/student/assignments" },
    { label: "Feedback", icon: "F", href: "#/student/feedback" },
    { label: "Progress", icon: "G", href: "#/student/progress" },
    { label: "Practice", icon: "R", href: "#/student/practice" },
  ],
};

const publicRoutes = [
  "home",
  "about",
  "contact",
  "help",
  "login",
  "signup",
  "password-reset",
  "verify-email",
];

// Hash routes are explicitly allowed so bad URLs fall back predictably.
const appRoutes = [
  ...publicRoutes,
  "teacher",
  "teacher/profile",
  "teacher/classes",
  "teacher/classes/create",
  "teacher/classes/scoreboard",
  "teacher/assignments",
  "teacher/assignments/create",
  "teacher/assignments/edit",
  "teacher/assignments/results",
  "teacher/analytics",
  "student",
  "student/profile",
  "student/classes",
  "student/classes/scoreboard",
  "student/assignments",
  "student/assignments/detail",
  "student/feedback",
  "student/progress",
  "student/practice",
  "student/question",
  "student/question-finish",
];

const dashboardContent = {
  teacher: {
    eyebrow: "Teacher home",
    greeting: "Good morning",
    description:
      "Your teaching dashboard is ready for classes, assignments, progress, and activity once they are added.",
    primaryAction: "Create assignment",
    secondaryAction: "Review analytics",
    badge: "Teacher workspace",
    stats: [
      { label: "Students active" },
      { label: "Work submitted" },
      { label: "Class confidence" },
    ],
    focus: {
      title: "Today's teaching focus",
      emptyTitle: "No teaching focus yet",
      emptyDescription:
        "A focus card will appear here after classes and assignments have activity.",
    },
    chartTitle: "Accuracy trend",
    chartTimeframe: "No lesson data yet",
    chartData: [],
    activity: [],
    emptyActivityTitle: "No activity yet",
    emptyActivityDescription:
      "Class updates, submissions, and review items will collect here.",
  },
  student: {
    eyebrow: "Student home",
    greeting: "Welcome back",
    description:
      "Your learning dashboard is ready for assignments, feedback, progress, and practice once they are added.",
    primaryAction: "Start practice",
    secondaryAction: "View feedback",
    badge: "Student workspace",
    stats: [
      { label: "Daily goal" },
      { label: "Current streak" },
      { label: "Skill growth" },
    ],
    focus: {
      title: "Next lesson",
      emptyTitle: "No lesson assigned yet",
      emptyDescription:
        "Assigned lessons and practice prompts will appear here.",
    },
    chartTitle: "Practice score",
    chartTimeframe: "No practice data yet",
    chartData: [],
    activity: [],
    emptyActivityTitle: "No activity yet",
    emptyActivityDescription:
      "Assignments, feedback, badges, and practice updates will collect here.",
  },
};

// The app is intentionally hash-routed so it works in static hosting.
function getPageFromHash() {
  const route =
    window.location.hash
      .replace(/^#\/?/, "")
      .split(/[?#]/)[0]
      .replace(/\/+$/, "")
      .toLowerCase() || "home";

  return appRoutes.includes(route) ? route : "home";
}

// Local role is only trusted when a session token exists.
function getCurrentRole() {
  const token =
    window.sessionStorage.getItem("pithonAuthToken") ||
    window.localStorage.getItem("pithonAuthToken");
  const role = String(
    window.localStorage.getItem("pithonCurrentRole") || ""
  ).trim().toLowerCase();

  if (!token) {
    return null;
  }

  return ["teacher", "student"].includes(role) ? role : null;
}

function getCurrentUsername() {
  return window.localStorage.getItem("pithonCurrentUsername") || "";
}

// Lightweight loader for dashboard panels that can tolerate empty API data.
function useAsyncData(loadData, dependencies, fallbackValue) {
  const [data, setData] = useState(fallbackValue);

  useEffect(() => {
    let ignore = false;

    loadData()
      .then((result) => {
        if (!ignore) {
          setData(result);
        }
      })
      .catch(() => {
        if (!ignore) {
          setData(fallbackValue);
        }
      });

    return () => {
      ignore = true;
    };
  // This helper intentionally forwards the caller's dependency list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return data;
}

function useDashboardData(role, username) {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    let ignore = false;

    if (!role || !username) {
      return undefined;
    }

    getDashboardData(role, username)
      .then((data) => {
        if (!ignore) {
          setDashboardData(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setDashboardData(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [role, username]);

  return dashboardData;
}

function useTopics() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    let ignore = false;

    getTopics()
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setTopics(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setTopics([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return topics;
}

function GeometricScrollPattern() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrollProgress(
        maxScroll > 0
          ? Math.min(window.scrollY / maxScroll, 1)
          : 0
      );
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const patternStyle = {
    "--scroll": scrollProgress,
    "--spin": `${scrollProgress * 120}deg`,
    "--spin-reverse": `${scrollProgress * -84}deg`,
    "--spin-ring-one": `${scrollProgress * 156}deg`,
    "--spin-ring-two": `${scrollProgress * -132}deg`,
    "--spin-orbit": `${scrollProgress * 216}deg`,
    "--slide": `${scrollProgress * 42}px`,
    "--scale": 1 + scrollProgress * 0.28,
    "--inner-scale": 1.16 - scrollProgress * 0.12,
    "--hue": `${196 - scrollProgress * 58}deg`,
  };

  return (
    <div
      className="homepage-pattern"
      style={patternStyle}
      aria-label="Scroll-reactive geometric PiThon pattern"
    >
      <div className="pattern-grid" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            style={{
              "--i": index,
              "--turn": `${index * 12}deg`,
              "--tile-scale": 0.72 + scrollProgress * 0.48,
            }}
          />
        ))}
      </div>
      <div className="pattern-ring pattern-ring-one" aria-hidden="true" />
      <div className="pattern-ring pattern-ring-two" aria-hidden="true" />
      <div className="pattern-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function usePageRoute() {
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPageFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return page;
}

function HomePage() {
  return (
    <>
      <section className="homepage-hero" aria-labelledby="homepage-title">
        <div className="homepage-copy">
          <h1 id="homepage-title">Build confident problem solvers with PiThon.</h1>
          <p>
            A friendly classroom workspace for practice, feedback, and progress.
          </p>
          <div className="homepage-actions">
            <Button
              className="homepage-cta"
              onClick={() => {
                window.location.hash = "#/signup";
              }}
            >
              Start now
            </Button>
          </div>
        </div>
        <div className="homepage-preview" aria-label="PiThon preview">
          <GeometricScrollPattern />
        </div>
      </section>

      <section className="homepage-features" aria-label="PiThon highlights">
        <Card
          title="Guided practice"
          body="Short activities help students build skill without losing momentum."
        />
        <Card
          title="Clear feedback"
          body="Teachers can spot progress and gaps from one calm dashboard."
        />
        <Card
          title="Fun"
          body="Engaging question sets that keep learning exciting"
        />
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <section className="page-panel about-section" aria-labelledby="about-title">
      <div className="section-copy">
        <h1 id="about-title">Practice for everyone.</h1>
        <p>
          PiThon is designed for classrooms where students need room to try,
          revise, and build confidence. Teachers get a clear view of progress
          while learners can stay focused on the next step.
        </p>
      </div>
      <div className="about-path" aria-label="PiThon learning flow">
        {lessonSteps.map((step, index) => (
          <div className="about-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const handleContactSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="page-panel contact-section" aria-labelledby="contact-title">
      <div className="section-copy">
        <span className="section-kicker">Contact</span>
        <h1 id="contact-title">Start a conversation with the PiThon team.</h1>
        <p>
          Tell us what you are trying to build for your class, family, or
          school. We will help point you toward the right starting place.
        </p>
      </div>
      <form className="contact-form" onSubmit={handleContactSubmit}>
        <label>
          Name
          <input type="text" name="name" placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" name="email" placeholder="you@example.com" />
        </label>
        <label className="contact-message">
          Message
          <textarea name="message" placeholder="How can we help?" />
        </label>
        <Button className="contact-submit" type="submit">Send message</Button>
        {sent ? <p className="form-success">Message ready for the PiThon team.</p> : null}
      </form>
    </section>
  );
}

function HelpPage() {
  return (
    <section className="page-panel help-section" aria-labelledby="help-title">
      <div className="section-copy">
        <span className="section-kicker">Help</span>
        <h1 id="help-title">Quick answers for smoother lessons.</h1>
        <p>
          Help is organized around the moments that matter most: getting set
          up, understanding progress, and supporting students mid-practice.
        </p>
      </div>
      <div className="help-grid">
        {helpTopics.map((topic) => (
          <article className="help-card" key={topic.title}>
            <strong>{topic.title}</strong>
            <p>{topic.body}</p>
            <a href="#/contact">Ask about this</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function getDashboardNavItems(role, page) {
  return dashboardNav[role].map((item) => ({
    ...item,
    current:
      page === item.href.replace("#/", "") ||
      (item.href === `#/${role}` && page === role),
  }));
}

function EmptySlot({ label, className = "" }) {
  return (
    <div className={`dashboard-empty-slot ${className}`.trim()}>
      <span>{label}</span>
    </div>
  );
}

function TopicCards({ onSelect, selectedTopicIds = [], topics }) {
  return (
    <div className="dashboard-topic-grid">
      {topics.map((topic) => (
        <button
          aria-pressed={selectedTopicIds.includes(topic.id)}
          className="dashboard-topic-card"
          key={topic.id}
          onClick={() => onSelect?.(topic.id)}
          type="button"
        >
          <strong>{topic.label}</strong>
          <p>{topic.description}</p>
        </button>
      ))}
    </div>
  );
}

function formatTopicLabels(topicIds = [], topics = []) {
  return (
    topicIds
      .map((topicId) => topics.find((topic) => topic.id === topicId)?.label)
      .filter(Boolean)
      .join(", ") || "No topic"
  );
}

function DashboardFrame({ children, page, role }) {
  const handleLogout = () => {
    window.localStorage.removeItem("pithonAuthToken");
    window.sessionStorage.removeItem("pithonAuthToken");
    window.localStorage.removeItem("pithonCurrentRole");
    window.localStorage.removeItem("pithonCurrentUsername");
    window.location.hash = "#/";
  };

  return (
    <section
      className={`dashboard-page dashboard-page-${role}`}
      aria-label={`${role} dashboard`}
    >
      <header className="dashboard-session-bar">
        <a className="dashboard-session-brand" href={`#/${role}`}>
          <LogoMark />
        </a>
        <Button size="sm" variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      <div className="dashboard-shell">
        <Sidebar items={getDashboardNavItems(role, page)} />
        <div className="dashboard-workspace">{children}</div>
      </div>
    </section>
  );
}

function DashboardHomePage({ page, role, username }) {
  const dashboardData = useDashboardData(role, username);
  const notifications = useAsyncData(
    () => getNotifications(username),
    [username],
    []
  );
  const content = {
    ...dashboardContent[role],
    activity: dashboardData?.activity?.length
      ? dashboardData.activity
      : dashboardContent[role].activity,
    chartData: dashboardData?.chartData?.length
      ? dashboardData.chartData
      : dashboardContent[role].chartData,
    focus: dashboardData?.focus ?? dashboardContent[role].focus,
    stats: dashboardData?.stats?.length
      ? dashboardData.stats
      : dashboardContent[role].stats,
  };
  const displayName = username || role;
  const handlePrimaryAction = () => {
    window.location.hash =
      role === "teacher" ? "#/teacher/assignments/create" : "#/student/practice";
  };
  const handleSecondaryAction = () => {
    window.location.hash =
      role === "teacher" ? "#/teacher/analytics" : "#/student/feedback";
  };
  const activityItems = [
    ...notifications.slice(0, 3).map((notification) => ({
      actionLabel: "Open",
      description: notification.message,
      media: "N",
      title: notification.title || "Notification",
    })),
    ...content.activity,
  ].map((item) => ({
    actionLabel: role === "teacher" ? "Review" : "Open",
    description:
      item.description ||
      item.prompt ||
      item.result ||
      "Recent dashboard activity.",
    media: item.media || (item.result === "correct" ? "C" : "A"),
    title: item.title || item.topicId || "Activity",
  }));

  return (
    <DashboardFrame page={page} role={role}>
      <header className="dashboard-hero-card">
        <div className="dashboard-hero-copy">
          <div className="dashboard-kicker-row">
            <span className="section-kicker">{content.eyebrow}</span>
            <Badge label={content.badge} variant="outline" />
          </div>
          <h1 id={`${role}-homepage-title`}>
            {content.greeting}, {displayName}.
          </h1>
          <p>{content.description}</p>
        </div>
        <div className="dashboard-actions">
          <Button onClick={handlePrimaryAction}>{content.primaryAction}</Button>
          <Button variant="secondary" onClick={handleSecondaryAction}>
            {content.secondaryAction}
          </Button>
        </div>
      </header>

      <div className="dashboard-stats-grid" aria-label={`${role} summary`}>
        {content.stats.map((stat) => (
          <article className="dashboard-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong className={stat.value ? "" : "dashboard-empty-value"}>
              {stat.value || ""}
            </strong>
            {stat.detail ? <p>{stat.detail}</p> : null}
          </article>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <article
          className={`dashboard-focus-card${
            content.focus.body ? "" : " is-empty"
          }`}
        >
          <div>
            <span className="section-kicker">Focus</span>
            <h2>{content.focus.title}</h2>
            {content.focus.body ? (
              <p>{content.focus.body}</p>
            ) : (
              <Empty
                title={content.focus.emptyTitle}
                description={content.focus.emptyDescription}
              />
            )}
          </div>
          {content.focus.progress ? (
            <div className="dashboard-progress-block">
              <span>{content.focus.meta}</span>
              <Progress value={content.focus.progress} />
            </div>
          ) : null}
          <div className="dashboard-lesson-art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </article>

        <article className="dashboard-chart-card">
          {content.chartData.length ? (
            <Chart
              data={content.chartData}
              title={content.chartTitle}
              timeframe={content.chartTimeframe}
            />
          ) : (
            <Empty
              title={content.chartTitle}
              description={content.chartTimeframe}
            />
          )}
        </article>
      </div>

      <section
        className="dashboard-activity-panel"
        aria-labelledby={`${role}-activity-title`}
      >
        <div className="dashboard-section-heading">
          <div>
            <span className="section-kicker">Up next</span>
            <h2 id={`${role}-activity-title`}>Activity queue</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.location.hash =
                role === "teacher" ? "#/teacher/analytics" : "#/student/progress";
            }}
          >
            View all
          </Button>
        </div>
        <Separator />
        <div className="dashboard-activity-list">
          {activityItems.length ? (
            activityItems.map((item, index) => (
              <Item
                key={`${item.title}-${index}`}
                title={item.title}
                description={item.description}
                media={<span>{item.media}</span>}
                actionLabel={item.actionLabel}
              />
            ))
          ) : (
            <Empty
              title={content.emptyActivityTitle}
              description={content.emptyActivityDescription}
            />
          )}
        </div>
      </section>
    </DashboardFrame>
  );
}

function StudentPageHeader({ badge, description, title }) {
  return (
    <header className="dashboard-page-header">
      <div>
        <span className="section-kicker">{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}

function StudentProfilePage({ page, username }) {
  const records = useAsyncData(() => getProgress(username), [username], []);
  const topics = useTopics();

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Profile"
        title={username || "Student profile"}
        description="Profile details can be shown here once the student account has saved information."
      />
      <section className="student-profile-grid">
        <article className="student-panel student-profile-card">
          <div className="student-avatar-shell" aria-hidden="true">
            {(username || "S").slice(0, 1).toUpperCase()}
          </div>
          <div className="student-field-stack">
            <div className="dashboard-record-card">
              <strong>{username || "Student"}</strong>
              <p>Signed in student account</p>
            </div>
            <div className="dashboard-record-card">
              <strong>{records.length}</strong>
              <p>Submitted answers</p>
            </div>
          </div>
        </article>
        <article className="student-panel">
          <div className="dashboard-list-stack">
            <div className="dashboard-record-card">
              <strong>Role</strong>
              <p>Student</p>
            </div>
            <div className="dashboard-record-card">
              <strong>Current topics</strong>
              <p>{formatTopicLabels(topics.map((topic) => topic.id), topics)}</p>
            </div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentClassesPage({ page, username }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [joinedMessage, setJoinedMessage] = useState("");
  const classes = useAsyncData(
    () => getStudentClasses(username),
    [username, refreshKey],
    []
  );

  const handleJoinClass = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setJoinedMessage("");

    const formData = new FormData(form);
    const inviteCode = String(formData.get("inviteCode") || "").trim();

    try {
      const result = await joinClass({
        inviteCode,
      });

      if (!result.joined) {
        setError(result.reason || "Could not join that class.");
        return;
      }

      form.reset();
      setJoinedMessage(`Joined ${result.class.name || "class"}.`);
      setRefreshKey((current) => current + 1);
    } catch (joinError) {
      setError(joinError.message || "Could not join that class.");
    }
  };

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Classes"
        title="Classes"
        description="Join a teacher class with an invite code to receive assigned work."
      />
      <section className="teacher-creator-layout">
        <form className="dashboard-panel teacher-form-panel" onSubmit={handleJoinClass}>
          <label className="dashboard-form-field">
            Invite code
            <input
              autoComplete="off"
              name="inviteCode"
              required
              type="text"
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          {joinedMessage ? <p className="form-success">{joinedMessage}</p> : null}
          <div className="student-action-row">
            <Button type="submit">Join class</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/student/assignments";
              }}
            >
              View assignments
            </Button>
          </div>
        </form>
        <article className="dashboard-panel">
          {classes.length ? (
            <div className="dashboard-list-stack">
              {classes.map((classRecord) => (
                <div className="dashboard-record-card" key={classRecord.id}>
                  <strong>{classRecord.name || "Untitled class"}</strong>
                  <p>
                    {classRecord.yearGroup || "No year"} -{" "}
                    {classRecord.subject || "No subject"}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      window.localStorage.setItem(
                        "pithonCurrentClassId",
                        classRecord.id
                      );
                      window.location.hash = "#/student/classes/scoreboard";
                    }}
                  >
                    Scoreboard
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No joined classes yet"
              description="Use an invite code from your teacher to join a class."
            />
          )}
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentAssignmentsPage({ page, username }) {
  const assignments = useAsyncData(
    () => getAssignments("student", username),
    [username],
    []
  );

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Assignments"
        title="Assignments"
        description="Assigned work will appear as selectable cards when a teacher adds it."
      />
      <section className="student-panel student-card-grid">
        {assignments.length ? (
          assignments.map((assignment) => (
            <a
              className="student-assignment-card dashboard-record-card"
              href="#/student/assignments/detail"
              key={assignment.id}
              onClick={() => {
                window.localStorage.setItem(
                  "pithonCurrentAssignmentId",
                  assignment.id
                );
              }}
            >
              <strong>{assignment.title || "Untitled assignment"}</strong>
              <p>{assignment.instructions || "No instructions added."}</p>
              {assignment.dueDate ? <p>Due {assignment.dueDate}</p> : null}
              <p>{assignment.questionLimit ?? assignment.questionIds?.length ?? 0} questions</p>
            </a>
          ))
        ) : (
          <div className="dashboard-list-stack">
            <Empty
              title="No assignments yet"
              description="Join a class with your teacher's invite code to receive assigned work."
            />
            <Button
              onClick={() => {
                window.location.hash = "#/student/classes";
              }}
            >
              Join a class
            </Button>
          </div>
        )}
      </section>
    </DashboardFrame>
  );
}

function StudentAssignmentDetailPage({ page, username }) {
  const assignmentId = window.localStorage.getItem("pithonCurrentAssignmentId");
  const assignments = useAsyncData(
    () => getAssignments("student", username),
    [username],
    []
  );
  const assignment = assignments.find((item) => item.id === assignmentId);

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Assignment"
        title="Assignment details"
        description="Instructions, resources, and start controls will appear here once an assignment is selected."
      />
      <section className="student-assignment-detail">
        <article className="student-panel student-detail-main">
          {assignment ? (
            <div className="dashboard-record-card">
              <strong>{assignment.title || "Untitled assignment"}</strong>
              <p>{assignment.instructions || "No instructions added."}</p>
              {assignment.dueDate ? <p>Due {assignment.dueDate}</p> : null}
              <p>{assignment.questionLimit ?? assignment.questionIds?.length ?? 0} questions</p>
            </div>
          ) : (
            <Empty
              title="No assignment selected"
              description="Choose an assignment from the assignment list first."
            />
          )}
          <div className="student-action-row">
            <Button
              onClick={() => {
                // Assignment mode uses finite teacher question sets.
                window.location.hash = "#/student/question";
                window.localStorage.setItem(
                  "pithonCurrentPracticeTopic",
                  assignment?.topicIds?.[0] || ""
                );
                window.localStorage.setItem(
                  "pithonCurrentAssignmentId",
                  assignment?.id || ""
                );
                window.localStorage.setItem("pithonQuestionMode", "assignment");
              }}
              disabled={!assignment}
            >
              Start
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/student/assignments";
              }}
            >
              Back
            </Button>
          </div>
        </article>
        <article className="student-panel">
          <div className="dashboard-record-card">
            <strong>Practice setup</strong>
            <p>
              Starting this assignment opens a question from its first selected
              topic. Results are saved to Progress and Feedback.
            </p>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentFeedbackPage({ page, username }) {
  const feedback = useAsyncData(() => getFeedback(username), [username], {
    hints: [],
    records: [],
  });

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Feedback"
        title="Feedback"
        description="Teacher comments and practice opportunities will appear here."
      />
      <section className="student-feedback-grid">
        <article className="student-panel student-feedback-list">
          {feedback.records.length ? (
            feedback.records.map((record) => (
              <div className="student-feedback-row" key={record.id}>
                <div className="dashboard-record-card">
                  <strong>{record.result}</strong>
                  <p>{record.prompt || "Practice answer submitted."}</p>
                  {record.feedback ? <p>{record.feedback}</p> : null}
                  {record.commonError ? <p>Common error: {record.commonError}</p> : null}
                  {record.workedExample ? <p>Worked example: {record.workedExample}</p> : null}
                  {record.steps?.length ? <p>Steps: {record.steps.join(" ")}</p> : null}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    window.localStorage.setItem(
                      "pithonCurrentPracticeTopic",
                      record.topicId || ""
                    );
                    window.location.hash = "#/student/question";
                  }}
                >
                  Practice
                </Button>
              </div>
            ))
          ) : (
            <Empty
              title="No feedback yet"
              description="Feedback will appear after submitted practice."
            />
          )}
        </article>
        <article className="student-panel">
          <div className="dashboard-record-card">
            <strong>Use feedback</strong>
            <p>
              Press Practice on any feedback item to retry a question from the
              same topic.
            </p>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentProgressPage({ page, username }) {
  const records = useAsyncData(() => getProgress(username), [username], []);
  const topics = useTopics();
  const correctRecords = records.filter((record) => record.result === "correct");
  const completionRate = records.length
    ? Math.round((correctRecords.length / records.length) * 100)
    : 0;
  const topicResults = topics.map((topic) => {
    const topicRecords = records.filter((record) => record.topicId === topic.id);
    const topicCorrect = topicRecords.filter((record) => record.result === "correct");

    return {
      label: topic.label,
      rate: topicRecords.length
        ? Math.round((topicCorrect.length / topicRecords.length) * 100)
        : null,
    };
  });
  const strengths = topicResults.filter((topic) => topic.rate !== null && topic.rate >= 70);
  const weaknesses = topicResults.filter((topic) => topic.rate !== null && topic.rate < 70);

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Progress"
        title="Progress"
        description="Progress summaries, recent wins, and growth charts will appear here."
      />
      <section className="student-progress-layout">
        <div className="student-progress-strip">
          <EmptySlot label={`${records.length} answered`} />
          <EmptySlot
            label={`${correctRecords.length} correct`}
          />
          <EmptySlot label={`${completionRate}% completion`} />
        </div>
        <article className="student-panel">
          {records.length ? (
            <div className="dashboard-list-stack">
              {records.slice().reverse().map((record) => (
                <div className="dashboard-record-card" key={record.id}>
                  <strong>{record.result}</strong>
                  <p>{record.prompt || "Practice question"}</p>
                </div>
              ))}
              <div className="dashboard-record-card">
                <strong>Strengths</strong>
                <p>{strengths.map((topic) => topic.label).join(", ") || "Not enough correct answers yet."}</p>
              </div>
              <div className="dashboard-record-card">
                <strong>Weaknesses</strong>
                <p>{weaknesses.map((topic) => topic.label).join(", ") || "No clear weak topics yet."}</p>
              </div>
            </div>
          ) : (
            <Empty
              title="No progress data yet"
              description="Completed practice and assessment results will fill this area."
            />
          )}
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentPracticePage({ page }) {
  const topics = useTopics();
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const activeTopicId = selectedTopicId || topics[0]?.id || "";

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Practice"
        title="Practice"
        description="Choose a topic and generate a practice question when you are ready."
      />
      <section className="student-practice-layout">
        <article className="student-panel student-practice-copy">
          <TopicCards
            onSelect={setSelectedTopicId}
            selectedTopicIds={[activeTopicId]}
            topics={topics}
          />
          <div className="dashboard-record-card">
            <strong>Selected topic</strong>
            <p>
              Press Start to generate a question for the highlighted topic.
            </p>
          </div>
          <div className="student-action-row">
            <Button
              onClick={() => {
                // Practice mode is intentionally infinite and not tied to an assignment.
                window.localStorage.setItem(
                  "pithonCurrentPracticeTopic",
                  activeTopicId
                );
                window.localStorage.removeItem("pithonCurrentAssignmentId");
                window.localStorage.setItem("pithonQuestionMode", "practice");
                window.location.hash = "#/student/question";
              }}
            >
              Start
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/student";
              }}
            >
              Cancel
            </Button>
          </div>
        </article>
        <article className="student-panel">
          <div className="dashboard-record-card">
            <strong>Ready when you are</strong>
            <p>
              Pick a topic, press Start, answer the generated question, and the
              result will be saved to Progress and Feedback.
            </p>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentQuestionPage({ page, username }) {
  const topicId =
    window.localStorage.getItem("pithonCurrentPracticeTopic") || "";
  const assignmentId =
    window.localStorage.getItem("pithonCurrentAssignmentId") || "";
  const questionMode =
    window.localStorage.getItem("pithonQuestionMode") === "assignment" &&
    assignmentId
      ? "assignment"
      : "practice";
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [questionRefreshKey, setQuestionRefreshKey] = useState(0);
  const practiceQuestion = useAsyncData(
    () => getPracticeQuestion(topicId, username),
    [topicId, username, questionRefreshKey],
    null
  );
  const delivery = useAsyncData(
    () =>
      questionMode === "assignment"
        ? getQuestionDelivery(username, assignmentId)
        : Promise.resolve(null),
    [questionMode, assignmentId, username, questionRefreshKey],
    null
  );
  const question =
    questionMode === "assignment" ? delivery?.nextQuestion : practiceQuestion;
  const assignmentComplete = questionMode === "assignment" && delivery?.complete;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotification(null);

    if (assignmentComplete) {
      setError("This assignment set is already complete.");
      return;
    }

    if (!question) {
      setError("Question is still loading.");
      return;
    }

    try {
      const result = await checkAnswer({
        // Blank assignment ids keep practice scores out of class test results.
        assignmentId: questionMode === "assignment" ? assignmentId : "",
        answer,
        expectedAnswer: question.expectedAnswer,
        hint: question.hint,
        points: question.points ?? 0,
        workedExample: question.workedExample,
        steps: question.steps,
        commonError: question.commonError,
        prompt: question.prompt,
        questionId: question.id,
        topicId: question.topicId,
        username,
      });

      window.localStorage.setItem(
        "pithonLastQuestionResult",
        JSON.stringify(result)
      );
      setNotification({
        result: result.result,
        pointsAwarded: result.record?.pointsAwarded ?? 0,
        pointsPossible: result.record?.pointsPossible ?? 0,
      });
      setAnswer("");
      setQuestionRefreshKey((current) => current + 1);
    } catch {
      setError("Could not submit the answer. Start the backend and try again.");
    }
  };

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Question"
        title={questionMode === "assignment" ? "Assignment question" : "Question"}
        description={
          questionMode === "assignment"
            ? "Complete the teacher's question set. Results will be sent to your teacher."
            : "Practice keeps generating new questions until you stop."
        }
      />
      <form className="student-question-layout" onSubmit={handleSubmit}>
        <article className="student-panel student-question-copy">
          {assignmentComplete ? (
            <Empty
              title="Assignment complete"
              description="Your saved answers and points are now available to your teacher."
            />
          ) : question ? (
            <div className="dashboard-record-card">
              <strong>{question.prompt}</strong>
              <p>
                Difficulty: {question.difficulty || "standard"} -{" "}
                {question.points ?? 0} points
              </p>
              {questionMode === "assignment" ? (
                <p>
                  Question {(delivery?.completedCount ?? 0) + 1} of{" "}
                  {delivery?.limit ?? 0}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptySlot label="Question content" />
          )}
          <label className="dashboard-form-field">
            Answer
            <input
              name="answer"
              onChange={(event) => setAnswer(event.target.value)}
              type="text"
              value={answer}
            />
          </label>
          <div className="student-action-row">
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.hash =
                  questionMode === "assignment"
                    ? "#/student/assignments"
                    : "#/student/practice";
              }}
            >
              Stop
            </Button>
            {error ? <p className="auth-error">{error}</p> : null}
          </div>
          {notification ? (
            <div
              className={`question-result-notice is-${notification.result}`}
              role="status"
            >
              <strong>
                {notification.result === "correct" ? "Correct" : "Incorrect"}
              </strong>
              <p>
                {notification.pointsAwarded} / {notification.pointsPossible}{" "}
                points saved
              </p>
            </div>
          ) : null}
        </article>
        <article className="student-panel student-question-side">
          <EmptySlot label={question?.visualLabel || "Question image"} />
          {question?.hint ? (
            <div className="dashboard-record-card">
              <strong>Hint</strong>
              <p>{question.hint}</p>
            </div>
          ) : null}
        </article>
      </form>
    </DashboardFrame>
  );
}

function StudentQuestionFinishPage({ page }) {
  const result = (() => {
    try {
      return JSON.parse(
        window.localStorage.getItem("pithonLastQuestionResult") || "null"
      );
    } catch {
      return null;
    }
  })();

  return (
    <DashboardFrame page={page} role="student">
      <section className="student-finish-panel">
        <div className="dashboard-record-card">
          <strong>{result?.record?.answer || "No answer saved"}</strong>
          <p>Your submitted answer</p>
        </div>
        {result?.record ? (
          <div className="dashboard-record-card">
            <strong>
              {result.record.pointsAwarded ?? 0} / {result.record.pointsPossible ?? 0}
            </strong>
            <p>Points earned</p>
          </div>
        ) : null}
        <Empty
          title={result ? `Answer ${result.result}` : "Question complete"}
          description={
            result?.feedback ||
            "Completion results and next-step feedback will appear here."
          }
        />
        <Button
          onClick={() => {
            window.location.hash = "#/student/practice";
          }}
        >
          Try another
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            window.location.hash = "#/student/progress";
          }}
        >
          View progress
        </Button>
      </section>
    </DashboardFrame>
  );
}

function StudentDashboardPage({ page, username }) {
  const view = page.replace("student/", "");

  if (view === "profile") {
    return <StudentProfilePage page={page} username={username} />;
  }
  if (view === "classes") {
    return <StudentClassesPage page={page} username={username} />;
  }
  if (view === "classes/scoreboard") {
    return <ClassScoreboardPage page={page} role="student" />;
  }
  if (view === "assignments") {
    return <StudentAssignmentsPage page={page} username={username} />;
  }
  if (view === "assignments/detail") {
    return <StudentAssignmentDetailPage page={page} username={username} />;
  }
  if (view === "feedback") {
    return <StudentFeedbackPage page={page} username={username} />;
  }
  if (view === "progress") {
    return <StudentProgressPage page={page} username={username} />;
  }
  if (view === "practice") {
    return <StudentPracticePage page={page} />;
  }
  if (view === "question") {
    return <StudentQuestionPage page={page} username={username} />;
  }
  if (view === "question-finish") {
    return <StudentQuestionFinishPage page={page} />;
  }

  return <DashboardHomePage page={page} role="student" username={username} />;
}

function TeacherProfilePage({ page, username }) {
  const classes = useAsyncData(() => getClasses(username), [username], []);
  const topics = useTopics();
  const assignments = useAsyncData(
    () => getAssignments("teacher", username),
    [username],
    []
  );

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Profile"
        title={username || "Teacher profile"}
        description="Teacher profile details can be shown here once account information is saved."
      />
      <section className="teacher-profile-grid">
        <article className="dashboard-panel teacher-profile-card">
          <div className="student-avatar-shell" aria-hidden="true">
            {(username || "T").slice(0, 1).toUpperCase()}
          </div>
          <div className="dashboard-field-stack">
            <div className="dashboard-record-card">
              <strong>{username || "Teacher"}</strong>
              <p>Signed in teacher account</p>
            </div>
            <div className="dashboard-record-card">
              <strong>{classes.length}</strong>
              <p>Classes created</p>
            </div>
          </div>
        </article>
        <article className="dashboard-panel">
          <div className="dashboard-list-stack">
            <div className="dashboard-record-card">
              <strong>{assignments.length}</strong>
              <p>Assignments created</p>
            </div>
            <div className="dashboard-record-card">
              <strong>Question topics</strong>
              <p>{formatTopicLabels(topics.map((topic) => topic.id), topics)}</p>
            </div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function TeacherClassesPage({ page, username }) {
  const classes = useAsyncData(() => getClasses(username), [username], []);

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Classes"
        title="Classes"
        description="Class groups will appear here once they are created."
      />
      <section className="dashboard-panel dashboard-card-grid with-add-card">
        {classes.map((classRecord) => (
          <div className="dashboard-record-card" key={classRecord.id}>
            <strong>{classRecord.name || "Untitled class"}</strong>
            <p>
              {classRecord.yearGroup || "No year"} -{" "}
              {classRecord.subject || "No subject"}
            </p>
            <Badge label={classRecord.inviteCode} variant="outline" />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.localStorage.setItem("pithonCurrentClassId", classRecord.id);
                window.location.hash = "#/teacher/classes/scoreboard";
              }}
            >
              Scoreboard
            </Button>
          </div>
        ))}
        <a className="dashboard-add-card" href="#/teacher/classes/create">
          <span aria-hidden="true">+</span>
          <strong>Create class</strong>
        </a>
      </section>
    </DashboardFrame>
  );
}

function TeacherClassCreatorPage({ page, username }) {
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await createClass({
        name: String(formData.get("name") || "").trim(),
        yearGroup: String(formData.get("yearGroup") || "").trim(),
        subject: String(formData.get("subject") || "").trim(),
        teacherUsername: username || "teacher",
      });
      window.location.hash = "#/teacher/classes";
    } catch (classError) {
      setError(classError.message || "Could not save the class.");
    }
  };

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Create class"
        title="Class creator"
        description="Create an empty class record that can hold students later."
      />
      <section className="teacher-creator-layout">
        <form className="dashboard-panel teacher-form-panel" onSubmit={handleSubmit}>
          <label className="dashboard-form-field">
            Class name
            <input name="name" required type="text" />
          </label>
          <label className="dashboard-form-field">
            Year group
            <input name="yearGroup" type="text" />
          </label>
          <label className="dashboard-form-field">
            Subject
            <input name="subject" type="text" />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="student-action-row">
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/teacher/classes";
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
        <article className="dashboard-panel">
          <div className="dashboard-list-stack">
            <div className="dashboard-record-card">
              <strong>Invite code</strong>
              <p>A short invite code is generated automatically when saved.</p>
            </div>
            <div className="dashboard-record-card">
              <strong>Students</strong>
              <p>Students can be linked to this class when enrolment is added.</p>
            </div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function TeacherAssignmentsPage({ page, username }) {
  const assignments = useAsyncData(
    () => getAssignments("teacher", username),
    [username],
    []
  );
  const topics = useTopics();

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Assignments"
        title="Assignments"
        description="Assignment drafts and published work will appear here once they are created."
      />
      <section className="dashboard-panel dashboard-card-grid with-add-card">
        {assignments.map((assignment) => (
          <div className="dashboard-record-card" key={assignment.id}>
            <strong>{assignment.title || "Untitled assignment"}</strong>
            <p>{assignment.instructions || "No instructions added."}</p>
            {assignment.dueDate ? <p>Due {assignment.dueDate}</p> : null}
            <p>{assignment.questionLimit ?? assignment.questionIds?.length ?? 0} questions</p>
            <Badge
              label={formatTopicLabels(assignment.topicIds, topics)}
              variant="outline"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.localStorage.setItem("pithonCurrentTeacherAssignmentId", assignment.id);
                window.location.hash = "#/teacher/assignments/edit";
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.localStorage.setItem(
                  "pithonCurrentTeacherAssignmentId",
                  assignment.id
                );
                window.location.hash = "#/teacher/assignments/results";
              }}
            >
              Results
            </Button>
          </div>
        ))}
        <a className="dashboard-add-card" href="#/teacher/assignments/create">
          <span aria-hidden="true">+</span>
          <strong>Create assignment</strong>
        </a>
      </section>
    </DashboardFrame>
  );
}

function TeacherAssignmentCreatorPage({ page, username }) {
  const isEditing = page.endsWith("/edit");
  const topics = useTopics();
  const classes = useAsyncData(() => getClasses(username), [username], []);
  const assignments = useAsyncData(
    () => getAssignments("teacher", username),
    [username],
    []
  );
  const editingAssignmentId = window.localStorage.getItem(
    "pithonCurrentTeacherAssignmentId"
  );
  const editingAssignment = assignments.find(
    (assignment) => assignment.id === editingAssignmentId
  );
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [error, setError] = useState("");
  const activeTopicIds = selectedTopicIds.length
    ? selectedTopicIds
    : editingAssignment?.topicIds?.length
      ? editingAssignment.topicIds
      : topics[0]?.id
      ? [topics[0].id]
      : [];

  const toggleTopic = (topicId) => {
    setSelectedTopicIds((current) =>
      (current.length ? current : activeTopicIds).includes(topicId)
        ? (current.length ? current : activeTopicIds).filter((item) => item !== topicId)
        : [...(current.length ? current : activeTopicIds), topicId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!activeTopicIds.length) {
      setError("Choose at least one topic.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      const payload = {
        classId: String(formData.get("classId") || ""),
        dueDate: String(formData.get("dueDate") || ""),
        instructions: String(formData.get("instructions") || "").trim(),
        questionLimit: Number(formData.get("questionLimit") || 5),
        teacherUsername: username,
        title: String(formData.get("title") || "").trim(),
        topicIds: activeTopicIds,
      };

      // Editing rebuilds the stored question set only when topics or limit change.
      if (isEditing && editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
      } else {
        await createAssignment(payload);
      }

      window.location.hash = "#/teacher/assignments";
    } catch {
      setError("Could not save the assignment. Check the backend and try again.");
    }
  };

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Create assignment"
        title={isEditing ? "Edit assignment" : "Assignment creator"}
        description="Set the class, topics, and instructions for a new assignment."
      />
      <section className="teacher-creator-layout">
        <form className="dashboard-panel teacher-form-panel" onSubmit={handleSubmit}>
          <label className="dashboard-form-field">
            Assignment title
            <input
              defaultValue={editingAssignment?.title || ""}
              name="title"
              required
              type="text"
            />
          </label>
          <label className="dashboard-form-field">
            Class
            <select defaultValue={editingAssignment?.classId || ""} name="classId">
              <option value="">All students</option>
              {classes.map((classRecord) => (
                <option key={classRecord.id} value={classRecord.id}>
                  {classRecord.name || "Untitled class"}
                </option>
              ))}
            </select>
          </label>
          <label className="dashboard-form-field">
            Due date
            <input
              defaultValue={editingAssignment?.dueDate || ""}
              name="dueDate"
              type="date"
            />
          </label>
          <label className="dashboard-form-field">
            Question limit
            <input
              defaultValue={editingAssignment?.questionLimit || 5}
              max="50"
              min="1"
              name="questionLimit"
              required
              type="number"
            />
          </label>
          <label className="dashboard-form-field">
            Instructions
            <textarea
              defaultValue={editingAssignment?.instructions || ""}
              name="instructions"
              rows="4"
            />
          </label>
          <TopicCards
            onSelect={toggleTopic}
            selectedTopicIds={activeTopicIds}
            topics={topics}
          />
          <div className="dashboard-record-card">
            <strong>Question set</strong>
            <p>
              Saving creates an assignment using the selected topics. Student
              practice questions are generated from those topics.
            </p>
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="student-action-row">
            <Button type="submit">{isEditing ? "Update" : "Save"}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/teacher/assignments";
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
        <article className="dashboard-panel">
          <div className="dashboard-list-stack">
            <div className="dashboard-record-card">
              <strong>Available topics</strong>
              <p>{formatTopicLabels(topics.map((topic) => topic.id), topics)}</p>
            </div>
            <div className="dashboard-record-card">
              <strong>Publishing</strong>
              <p>Assignments saved here immediately appear for students.</p>
            </div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function TeacherAssignmentResultsPage({ page }) {
  const assignmentId =
    window.localStorage.getItem("pithonCurrentTeacherAssignmentId") || "";
  const results = useAsyncData(
    () => (assignmentId ? getAssignmentResults(assignmentId) : Promise.resolve(null)),
    [assignmentId],
    null
  );
  const rows = results?.rows ?? [];

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Results"
        title={results?.assignment?.title || "Assignment results"}
        description="Student results for this question set appear here as they submit answers."
      />
      <section className="teacher-analytics-layout">
        <div className="teacher-analytics-strip">
          <EmptySlot label={`${rows.length} students`} />
          <EmptySlot
            label={`${rows.filter((row) => row.complete).length} complete`}
          />
          <EmptySlot label={`${results?.assignment?.questionLimit ?? 0} questions`} />
        </div>
        <article className="dashboard-panel">
          {rows.length ? (
            <div className="dashboard-list-stack">
              {rows.map((row) => (
                <div className="dashboard-record-card" key={row.username}>
                  <strong>{row.username}</strong>
                  <p>
                    {row.points} / {row.pointsPossible} points - {row.correct}{" "}
                    correct from {row.answered} answered
                  </p>
                  <Badge
                    label={row.complete ? "Complete" : "In progress"}
                    variant="outline"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No student results yet"
              description="Results will appear after students start this assignment."
            />
          )}
          <div className="student-action-row">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.hash = "#/teacher/assignments";
              }}
            >
              Back to assignments
            </Button>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}

function TeacherAnalyticsPage({ page, username }) {
  const analytics = useAsyncData(
    () => getTeacherAnalytics(username),
    [username],
    { assignments: [], classes: [], records: [], stats: [] }
  );

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Analytics"
        title="Analytics"
        description="Class trends, progress snapshots, and insight panels will appear here once learner activity exists."
      />
      <section className="teacher-analytics-layout">
        <div className="teacher-analytics-strip">
          {(analytics.stats.length
            ? analytics.stats
            : [
                { label: "Classes", value: 0 },
                { label: "Assignments", value: 0 },
                { label: "Answers", value: 0 },
              ]
          ).map((stat) => (
            <EmptySlot label={`${stat.value} ${stat.label}`} key={stat.label} />
          ))}
        </div>
        <article className="dashboard-panel">
          {analytics.records.length ? (
            <div className="dashboard-list-stack">
              {analytics.records.slice().reverse().map((record) => (
                <div className="dashboard-record-card" key={record.id}>
                  <strong>{record.result}</strong>
                  <p>{record.prompt || "Practice answer"}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No answer records yet"
              description="Student submissions will appear here after practice."
            />
          )}
        </article>
      </section>
    </DashboardFrame>
  );
}

function ClassScoreboardPage({ page, role }) {
  const classId = window.localStorage.getItem("pithonCurrentClassId") || "";
  const scoreboard = useAsyncData(
    () => (classId ? getClassScoreboard(classId) : Promise.resolve(null)),
    [classId],
    null
  );
  const rows = scoreboard?.rows ?? [];

  return (
    <DashboardFrame page={page} role={role}>
      <StudentPageHeader
        badge="Scoreboard"
        title={scoreboard?.class?.name || "Class scoreboard"}
        description="Points from completed class questions appear here."
      />
      <section className="dashboard-panel">
        {rows.length ? (
          <div className="dashboard-list-stack">
            {rows.map((row, index) => (
              <div className="dashboard-record-card" key={row.username}>
                <strong>
                  {index + 1}. {row.username}
                </strong>
                <p>
                  {row.points} points - {row.correct} correct from{" "}
                  {row.answered} answered
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No points yet"
            description="Students will appear here after they complete questions for this class."
          />
        )}
        <div className="student-action-row">
          <Button
            variant="secondary"
            onClick={() => {
              window.location.hash = `#/${role}/classes`;
            }}
          >
            Back to classes
          </Button>
        </div>
      </section>
    </DashboardFrame>
  );
}

function TeacherDashboardPage({ page, username }) {
  const view = page.replace("teacher/", "");

  if (view === "profile") {
    return <TeacherProfilePage page={page} username={username} />;
  }
  if (view === "classes") {
    return <TeacherClassesPage page={page} username={username} />;
  }
  if (view === "classes/create") {
    return <TeacherClassCreatorPage page={page} username={username} />;
  }
  if (view === "classes/scoreboard") {
    return <ClassScoreboardPage page={page} role="teacher" />;
  }
  if (view === "assignments") {
    return <TeacherAssignmentsPage page={page} username={username} />;
  }
  if (view === "assignments/create") {
    return <TeacherAssignmentCreatorPage page={page} username={username} />;
  }
  if (view === "assignments/edit") {
    return <TeacherAssignmentCreatorPage page={page} username={username} />;
  }
  if (view === "assignments/results") {
    return <TeacherAssignmentResultsPage page={page} />;
  }
  if (view === "analytics") {
    return <TeacherAnalyticsPage page={page} username={username} />;
  }

  return <DashboardHomePage page={page} role="teacher" username={username} />;
}

function ProtectedDashboardPage({ currentRole, page, role, username }) {
  // Role-specific pages are isolated so students and teachers cannot cross views.
  if (currentRole !== role) {
    return <Login />;
  }

  if (role === "student") {
    return <StudentDashboardPage page={page} username={username} />;
  }

  return <TeacherDashboardPage page={page} username={username} />;
}

function getRouteRole(page) {
  return page.split("/")[0];
}

function isRoleRoute(page, role) {
  return page === role || page.startsWith(`${role}/`);
}

function App() {
  const page = usePageRoute();
  const currentRole = getCurrentRole();
  const currentUsername = getCurrentUsername();
  const effectivePage = currentRole
    // Logged-in users stay inside their own dashboard instead of public pages.
    ? isRoleRoute(page, currentRole)
      ? page
      : currentRole
    : page;
  const effectiveRole = getRouteRole(effectivePage);
  const isDashboardRoute = ["teacher", "student"].includes(effectiveRole);
  const pageContent = {
    home: <HomePage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    help: <HelpPage />,
    login: <Login />,
    signup: <SignUp />,
    "password-reset": <PasswordReset />,
    "verify-email": <EmailVerification />,
  };
  const activeNavItems = navItems.map((item) => ({
    ...item,
    current: item.href === `#/${effectivePage === "home" ? "" : effectivePage}`,
  }));
  const currentPageContent = isDashboardRoute ? (
    <ProtectedDashboardPage
      currentRole={currentRole}
      page={effectivePage}
      role={effectiveRole}
      username={currentUsername}
    />
  ) : (
    pageContent[effectivePage]
  );

  return (
    <main className="app">
      {!currentRole ? (
        <header className="homepage-nav" aria-label="Public homepage">
          <a className="homepage-brand" href="#/" aria-label="PiThon home">
            <LogoMark />
          </a>
          <NavigationMenu items={activeNavItems} />
          <div className="homepage-auth">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.hash = "#/login";
              }}
            >
              Log in
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.location.hash = "#/signup";
              }}
            >
              Sign up
            </Button>
          </div>
        </header>
      ) : null}

      {currentPageContent}
    </main>
  );
}

export default App;
