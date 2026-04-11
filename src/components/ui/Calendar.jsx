import { useMemo } from "react";
import { weekdays, buildCalendarMatrix } from "./data";

export function Calendar({ date = new Date() }) {
  const matrix = useMemo(() => buildCalendarMatrix(date), [date]);
  const monthLabel = date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="ui-calendar">
      <div className="ui-calendar-header">
        <strong>{monthLabel}</strong>
        <span>Teacher view</span>
      </div>
      <div className="ui-calendar-grid">
        {weekdays.map((day) => (
          <span key={day} className="ui-calendar-day">
            {day}
          </span>
        ))}
        {matrix.flat().map((day, index) => (
          <span
            key={`${day}-${index}`}
            className={`ui-calendar-cell${day ? "" : " is-empty"}`}
          >
            {day || ""}
          </span>
        ))}
      </div>
    </div>
  );
}
