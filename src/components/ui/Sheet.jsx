import { useEffect, useState } from "react";
import { Button } from "./Button";

export function Sheet({ title = "Filters" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="ui-sheet">
      <Button size="sm" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <div
        className={`ui-sheet-overlay${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`ui-sheet-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="ui-sheet-header">
          <strong>{title}</strong>
          <button
            type="button"
            className="ui-sheet-close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <p>Slide-over panel for quick adjustments.</p>
        <div className="ui-sheet-actions">
          <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    </div>
  );
}
