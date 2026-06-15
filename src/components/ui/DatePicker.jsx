import { useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const next = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      next.getFullYear() === Number(year) &&
      next.getMonth() === Number(month) - 1 &&
      next.getDate() === Number(day)
    ) {
      return next;
    }
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const next = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      next.getFullYear() === Number(year) &&
      next.getMonth() === Number(month) - 1 &&
      next.getDate() === Number(day)
    ) {
      return next;
    }
  }

  return null;
};

export function DatePicker({ label = "Due date" }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const commitInput = () => {
    const parsed = parseDate(inputValue);
    if (parsed) {
      setSelectedDate(parsed);
      setInputValue(formatDate(parsed));
    }
  };

  return (
    <div className="ui-field ui-date-picker" ref={wrapperRef}>
      <label className="ui-label">{label}</label>
      <div className="ui-date-input">
        <input
          className="ui-input"
          type="text"
          placeholder="YYYY-MM-DD"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={commitInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitInput();
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          className="ui-date-button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open calendar"
        >
          v
        </button>
      </div>
      {open && (
        <div className="ui-date-panel" role="dialog">
          <Calendar
            date={selectedDate ?? new Date()}
            selected={selectedDate}
            onSelect={(nextDate) => {
              setSelectedDate(nextDate);
              setInputValue(formatDate(nextDate));
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
