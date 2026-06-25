import { useEffect, useState } from "react";
import "./App.css";
import "./components/ui.css";
import {
  Button,
  Card,
  LogoMark,
  NavigationMenu,
} from "./components/ui/index.js";
import {
  EmailVerification,
  Login,
  PasswordReset,
  SignUp,
} from "./components/auth/index.js";

const navItems = [
  { label: "Home", href: "#/" },
  { label: "Teacher", href: "#/teacher" },
  { label: "Student", href: "#/student" },
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

const teacherCards = [
  { label: "Class overview", className: "dashboard-tile compact" },
  { label: "Assignment status", className: "dashboard-tile compact" },
  { label: "Activity image", className: "dashboard-image-slot", empty: true },
  { label: "Progress snapshot", className: "dashboard-tile wide" },
  { label: "Upcoming checks", className: "dashboard-tile compact" },
];

const studentCards = [
  { label: "Daily goal", className: "dashboard-tile compact" },
  { label: "Practice image", className: "dashboard-image-slot", empty: true },
  { label: "Feedback image", className: "dashboard-image-slot", empty: true },
  { label: "Current lesson", className: "dashboard-tile wide" },
  { label: "Streak", className: "dashboard-tile compact" },
];

const dashboardNav = {
  teacher: ["Home", "Profile", "Classes", "Assignments", "Analytics"],
  student: ["Home", "Profile", "Assignments", "Feedback", "Progress", "Practice"],
};

function getPageFromHash() {
  const route = window.location.hash.replace("#/", "") || "home";
  return [
    "home",
    "about",
    "contact",
    "help",
    "login",
    "signup",
    "password-reset",
    "verify-email",
    "teacher",
    "student",
  ].includes(route)
    ? route
    : "home";
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

function DashboardHomePage({ role }) {
  const title = `${role[0].toUpperCase()}${role.slice(1)} homepage`;
  const cards = role === "teacher" ? teacherCards : studentCards;

  return (
    <section
      className={`dashboard-page dashboard-page-${role}`}
      aria-labelledby={`${role}-homepage-title`}
    >
      <div className="dashboard-shell">
        <aside className="dashboard-rail" aria-label={`${role} dashboard navigation`}>
          {dashboardNav[role].map((item) => (
            <a href={`#/${role}`} key={item}>
              {item}
            </a>
          ))}
        </aside>
        <div className="dashboard-board">
          <div className="dashboard-title-bar" aria-hidden="true" />
          <div className="dashboard-grid">
            {cards.map((card) =>
              card.empty ? (
                <div
                  className={card.className}
                  aria-label={`${card.label} placeholder`}
                  key={card.label}
                />
              ) : (
                <article className={card.className} key={card.label}>
                  <span>{card.label}</span>
                </article>
              )
            )}
          </div>
        </div>
        <div className="dashboard-profile-dot" aria-hidden="true" />
      </div>
      <h1 id={`${role}-homepage-title`}>{title}</h1>
    </section>
  );
}

function App() {
  const page = usePageRoute();
  const pageContent = {
    home: <HomePage />,
    teacher: <DashboardHomePage role="teacher" />,
    student: <DashboardHomePage role="student" />,
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
    current: item.href === `#/${page === "home" ? "" : page}`,
  }));

  return (
    <main className="app">
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

      {pageContent[page]}
    </main>
  );
}

export default App;
