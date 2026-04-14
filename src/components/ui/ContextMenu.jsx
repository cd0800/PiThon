import { useEffect, useRef, useState } from "react";

export function ContextMenu({
  label = "Right click",
  items = ["Duplicate", "Share", "Archive"],
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return;
      }
      setOpen(false);
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

  const openAtPointer = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className="ui-context" onContextMenu={openAtPointer}>
      <div
        className="ui-context-trigger"
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
      >
        {label}
      </div>
      {open && (
        <div
          className="ui-context-menu"
          role="menu"
          ref={menuRef}
        >
          {items.map((item) => (
            <button key={item} className="ui-context-item" type="button">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
