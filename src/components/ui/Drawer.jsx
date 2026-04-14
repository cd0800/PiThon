import { useEffect, useState } from "react";
import { Button } from "./Button";

export function Drawer({ title = "Student list" }) {
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
    <div className="ui-drawer">
      <Button size="sm" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <div
        className={`ui-drawer-overlay${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`ui-drawer-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="ui-drawer-header">
          <strong>{title}</strong>
          <button
            type="button"
            className="ui-drawer-close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <p>Pulls up from the bottom on mobile.</p>
        <div className="ui-drawer-actions">
          <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm">View roster</Button>
        </div>
      </div>
    </div>
  );
}
