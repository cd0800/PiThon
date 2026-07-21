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
  getAssignments,
  getClasses,
  getDashboardData,
  getFeedback,
  getPracticeQuestion,
  getProgress,
  getTopics,
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

const fallbackQuestionTopics = [
  {
    id: "arithmetic",
    label: "Arithmetic",
    description:
      "Whole numbers, fractions, decimals, percentages, and order of operations.",
  },
  {
    id: "basic-algebra",
    label: "Basic algebra",
    description:
      "Variables, expressions, simple equations, substitution, and patterns.",
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

const appRoutes = [
  ...publicRoutes,
  "teacher",
  "teacher/profile",
  "teacher/classes",
  "teacher/classes/create",
  "teacher/assignments",
  "teacher/assignments/create",
  "teacher/analytics",
  "student",
  "student/profile",
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

function getPageFromHash() {
  const route = window.location.hash.replace("#/", "") || "home";
  return appRoutes.includes(route) ? route : "home";
}

function getCurrentRole() {
  const role = window.localStorage.getItem("pithonCurrentRole");
  return ["teacher", "student"].includes(role) ? role : null;
}

function getCurrentUsername() {
  return window.localStorage.getItem("pithonCurrentUsername") || "";
}

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
  const [topics, setTopics] = useState(fallbackQuestionTopics);

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
          setTopics(fallbackQuestionTopics);
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
            <Button className="homepage-cta">Start now</Button>
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
        <h1 id="about-title">Practice that feels calm enough to keep going.</h1>
        <p>
          PiThon is designed for classrooms where students need room to try,
          revise, and build confidence. Teachers get a clear view of progress
          while learners stay focused on the next small step.
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
  const handleContactSubmit = (event) => {
    event.preventDefault();
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
          <textarea name="message" placeholder="How can PiThon help?" />
        </label>
        <Button className="contact-submit" type="submit">Send message</Button>
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

function DashboardFrame({ children, page, role }) {
  const handleLogout = () => {
    window.localStorage.removeItem("pithonAuthToken");
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
          <Button>{content.primaryAction}</Button>
          <Button variant="secondary">{content.secondaryAction}</Button>
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
          <Button size="sm" variant="ghost">View all</Button>
        </div>
        <Separator />
        <div className="dashboard-activity-list">
          {content.activity.length ? (
            content.activity.map((item) => (
              <Item
                key={item.title}
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
            <EmptySlot label="Display name" />
            <EmptySlot label="Email" />
            <EmptySlot label="Class" />
          </div>
        </article>
        <article className="student-panel">
          <Empty
            title="No profile details yet"
            description="Learning preferences, class details, and account notes will appear here."
          />
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
            </a>
          ))
        ) : (
          <Empty
            title="No assignments yet"
            description="Assignments created by a teacher will appear here."
          />
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
                window.location.hash = "#/student/question";
                window.localStorage.setItem(
                  "pithonCurrentPracticeTopic",
                  assignment?.topicIds?.[0] || "arithmetic"
                );
              }}
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
          <EmptySlot label="Resource preview" className="is-tall" />
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
                </div>
                <Button size="sm" variant="secondary">Practice</Button>
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
          <EmptySlot label="Practice preview" className="is-tall" />
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentProgressPage({ page, username }) {
  const records = useAsyncData(() => getProgress(username), [username], []);

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
            label={`${records.filter((record) => record.result === "correct").length} correct`}
          />
          <EmptySlot
            label={`${records.filter((record) => record.result === "incorrect").length} incorrect`}
          />
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
  const [selectedTopicId, setSelectedTopicId] = useState("arithmetic");

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Practice"
        title="Practice"
        description="Practice choices and preview material will appear here when available."
      />
      <section className="student-practice-layout">
        <article className="student-panel student-practice-copy">
          <TopicCards
            onSelect={setSelectedTopicId}
            selectedTopicIds={[selectedTopicId]}
            topics={topics}
          />
          <EmptySlot label="Practice question area" />
          <div className="student-action-row">
            <Button
              onClick={() => {
                window.localStorage.setItem(
                  "pithonCurrentPracticeTopic",
                  selectedTopicId
                );
                window.location.hash = "#/student/question";
              }}
            >
              Start
            </Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </article>
        <article className="student-panel">
          <EmptySlot label="Practice preview" className="is-tall" />
        </article>
      </section>
    </DashboardFrame>
  );
}

function StudentQuestionPage({ page, username }) {
  const topicId =
    window.localStorage.getItem("pithonCurrentPracticeTopic") || "arithmetic";
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const question = useAsyncData(
    () => getPracticeQuestion(topicId),
    [topicId],
    null
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!question) {
      setError("Question is still loading.");
      return;
    }

    try {
      const result = await checkAnswer({
        answer,
        expectedAnswer: question.expectedAnswer,
        hint: question.hint,
        prompt: question.prompt,
        questionId: question.id,
        topicId: question.topicId,
        username,
      });

      window.localStorage.setItem(
        "pithonLastQuestionResult",
        JSON.stringify(result)
      );
      window.location.hash = "#/student/question-finish";
    } catch {
      setError("Could not submit the answer. Start the backend and try again.");
    }
  };

  return (
    <DashboardFrame page={page} role="student">
      <StudentPageHeader
        badge="Question"
        title="Question"
        description="Question content, answer input, and supporting visuals will appear here during practice."
      />
      <form className="student-question-layout" onSubmit={handleSubmit}>
        <article className="student-panel student-question-copy">
          {question ? (
            <div className="dashboard-record-card">
              <strong>{question.prompt}</strong>
              <p>{question.hint}</p>
            </div>
          ) : (
            <EmptySlot label="Question content" />
          )}
          <div className="student-action-row">
            <Button type="submit">Submit</Button>
            {error ? <p className="auth-error">{error}</p> : null}
          </div>
        </article>
        <article className="student-panel student-question-side">
          <EmptySlot label={question?.visualLabel || "Question image"} />
          <label className="dashboard-form-field">
            Answer
            <input
              name="answer"
              onChange={(event) => setAnswer(event.target.value)}
              type="text"
              value={answer}
            />
          </label>
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
        <EmptySlot label="Result image" />
        <Empty
          title={result ? `Answer ${result.result}` : "Question complete"}
          description={
            result?.feedback ||
            "Completion results and next-step feedback will appear here."
          }
        />
        <Button
          variant="secondary"
          onClick={() => {
            window.location.hash = "#/student";
          }}
        >
          Home
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
            <EmptySlot label="Display name" />
            <EmptySlot label="Email" />
            <EmptySlot label="School" />
          </div>
        </article>
        <article className="dashboard-panel">
          <Empty
            title="No profile details yet"
            description="Teaching areas, classes, and account notes will appear here."
          />
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
        teacherUsername: username,
      });
      window.location.hash = "#/teacher/classes";
    } catch {
      setError("Could not save the class. Start the backend and try again.");
    }
  };

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Create class"
        title="Class creator"
        description="Class name, invite details, and optional cover material can be added here."
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
          <EmptySlot label="Class image" className="is-tall" />
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
            <Badge
              label={assignment.topicIds?.join(", ") || "No topic"}
              variant="outline"
            />
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
  const topics = useTopics();
  const classes = useAsyncData(() => getClasses(username), [username], []);
  const [selectedTopicIds, setSelectedTopicIds] = useState(["arithmetic"]);
  const [error, setError] = useState("");

  const toggleTopic = (topicId) => {
    setSelectedTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((item) => item !== topicId)
        : [...current, topicId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await createAssignment({
        classId: String(formData.get("classId") || ""),
        instructions: String(formData.get("instructions") || "").trim(),
        teacherUsername: username,
        title: String(formData.get("title") || "").trim(),
        topicIds: selectedTopicIds,
      });
      window.location.hash = "#/teacher/assignments";
    } catch {
      setError("Could not save the assignment. Start the backend and try again.");
    }
  };

  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Create assignment"
        title="Assignment creator"
        description="Assignment instructions, class selection, and resource previews can be configured here."
      />
      <section className="teacher-creator-layout">
        <form className="dashboard-panel teacher-form-panel" onSubmit={handleSubmit}>
          <label className="dashboard-form-field">
            Assignment title
            <input name="title" required type="text" />
          </label>
          <label className="dashboard-form-field">
            Class
            <select name="classId">
              <option value="">All students</option>
              {classes.map((classRecord) => (
                <option key={classRecord.id} value={classRecord.id}>
                  {classRecord.name || "Untitled class"}
                </option>
              ))}
            </select>
          </label>
          <label className="dashboard-form-field">
            Instructions
            <textarea name="instructions" rows="4" />
          </label>
          <TopicCards
            onSelect={toggleTopic}
            selectedTopicIds={selectedTopicIds}
            topics={topics}
          />
          <EmptySlot label="Question set" />
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="student-action-row">
            <Button type="submit">Save</Button>
            <Button
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
          <EmptySlot label="Assignment image" className="is-tall" />
        </article>
      </section>
    </DashboardFrame>
  );
}

function TeacherAnalyticsPage({ page }) {
  return (
    <DashboardFrame page={page} role="teacher">
      <StudentPageHeader
        badge="Analytics"
        title="Analytics"
        description="Class trends, progress snapshots, and insight panels will appear here once learner activity exists."
      />
      <section className="teacher-analytics-layout">
        <div className="teacher-analytics-strip">
          {Array.from({ length: 3 }, (_, index) => (
            <EmptySlot label="Insight card" key={index} />
          ))}
        </div>
        <article className="dashboard-panel">
          <Empty
            title="No analytics yet"
            description="Class and assignment activity will fill this analytics area."
          />
        </article>
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
  if (view === "assignments") {
    return <TeacherAssignmentsPage page={page} username={username} />;
  }
  if (view === "assignments/create") {
    return <TeacherAssignmentCreatorPage page={page} username={username} />;
  }
  if (view === "analytics") {
    return <TeacherAnalyticsPage page={page} />;
  }

  return <DashboardHomePage page={page} role="teacher" username={username} />;
}

function ProtectedDashboardPage({ currentRole, page, role, username }) {
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
