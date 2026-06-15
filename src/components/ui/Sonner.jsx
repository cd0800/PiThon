import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

const TOAST_DURATION = 4000;

const buildToast = (title, body, { undoable = true } = {}) => ({
  id: `${Date.now()}-${Math.random()}`,
  title,
  body,
  undoable,
});

export function Sonner() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    const timer = timersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }
  };

  const pushToast = (title, body, options) => {
    const toast = buildToast(title, body, options);
    setToasts((prev) => [toast, ...prev]);
    const timer = setTimeout(() => removeToast(toast.id), TOAST_DURATION);
    timersRef.current.set(toast.id, timer);
  };

  const handleNotify = () => {
    pushToast("Saved", "Assignment draft saved.");
  };

  const handleUndo = (toastId) => {
    removeToast(toastId);
    pushToast("Action reversed", "Your last change was undone.", {
      undoable: false,
    });
  };

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  return (
    <div className="ui-sonner">
      <Button size="sm" onClick={handleNotify}>
        Show notification
      </Button>
      <div className="ui-sonner-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="ui-toast">
            <strong>{toast.title}</strong>
            <span>{toast.body}</span>
            {toast.undoable ? (
              <div className="ui-toast-actions">
                <button
                  type="button"
                  className="ui-toast-action"
                  onClick={() => handleUndo(toast.id)}
                >
                  Undo
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
