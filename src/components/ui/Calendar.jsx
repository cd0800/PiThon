import { useEffect, useMemo, useState } from "react";
import { weekdays, buildCalendarMatrix } from "./data";

const YEAR_SPAN = 6;

export function Calendar({ date = new Date(), selected, onSelect }) {
  const initialDate = selected ?? date;
  const [viewDate, setViewDate] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  useEffect(() => {
    if (!selected) {
      return;
    }
    setViewDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected]);

  const matrix = useMemo(() => buildCalendarMatrix(viewDate), [viewDate]);
  const monthLabel = viewDate.toLocaleString("en-US", {
    month: "long",
  });
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const yearOptions = useMemo(() => {
    const start = viewYear - YEAR_SPAN;
    const end = viewYear + YEAR_SPAN;
    const years = [];
    for (let year = start; year <= end; year += 1) {
      years.push(year);
    }
    return years;
  }, [viewYear]);

  const handlePrevMonth = () => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    setViewDate((prev) => new Date(nextYear, prev.getMonth(), 1));
  };

  const today = new Date();
  const isToday = (day) =>
    day &&
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isSelected = (day) =>
    day &&
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  return (
    <div className="ui-calendar">
      <div className="ui-calendar-header">
        <div className="ui-calendar-controls">
          <button
            type="button"
            className="ui-calendar-nav"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            &lt;
          </button>
          <div className="ui-calendar-title">
            <strong>{monthLabel.slice(0, 3)}</strong>
          </div>
          <select
            className="ui-select ui-calendar-year"
            value={viewYear}
            onChange={handleYearChange}
            aria-label="Select year"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ui-calendar-nav"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="ui-calendar-grid">
        {weekdays.map((day) => (
          <span key={day} className="ui-calendar-day">
            {day}
          </span>
        ))}
        {matrix.flat().map((day, index) => (
          <div key={`${day}-${index}`}>
            {day ? (
              <button
                type="button"
                className={`ui-calendar-cell${
                  isSelected(day) ? " is-selected" : ""
                }${isToday(day) ? " is-today" : ""}`}
                onClick={() =>
                  onSelect?.(new Date(viewYear, viewMonth, day))
                }
              >
                {day}
              </button>
            ) : (
              <span className="ui-calendar-cell is-empty" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
