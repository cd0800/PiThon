export const defaultAccordionItems = [
  {
    title: "Create assignments",
    content: "Build quizzes, warmups, or homework sets in minutes.",
  },
  {
    title: "Assign to classes",
    content: "Schedule due dates and share with your roster.",
  },
  {
    title: "Review progress",
    content: "See student submissions and class trends.",
  },
];

export const defaultBreadcrumb = [
  { label: "Home", href: "#" },
  { label: "Assignments", href: "#" },
  { label: "Quadratics", href: "#" },
];

export const defaultCommandItems = [
  "New assignment",
  "Import questions",
  "Grade submissions",
  "Open roster",
];

export const defaultDataTable = {
  columns: ["Student", "Status", "Score"],
  rows: [
    ["Alex", "Submitted", "92"],
    ["Jordan", "In progress", "--"],
    ["Priya", "Submitted", "88"],
  ],
};

export const defaultTabs = [
  { id: "overview", label: "Overview", content: "Class summary and pacing." },
  { id: "questions", label: "Questions", content: "Question bank and tags." },
  { id: "grading", label: "Grading", content: "Rubrics and feedback." },
];

export const defaultChartData = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 2 },
  { label: "Thu", value: 6 },
  { label: "Fri", value: 4 },
];

export const defaultCarouselItems = [
  "Algebra Warmup",
  "Geometry Exit Ticket",
  "Statistics Quiz",
];

export const defaultToggleOptions = ["Easy", "Medium", "Hard"];

export const defaultSonnerItems = [
  { title: "Saved", body: "Assignment draft saved." },
  { title: "Shared", body: "Sent to Period 3." },
];

export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildCalendarMatrix(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let day = 1;

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (weekIndex === 0 && dayIndex < startDay) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day += 1;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) {
      break;
    }
  }
  return weeks;
}
