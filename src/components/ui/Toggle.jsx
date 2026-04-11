import { useState } from "react";

export function Toggle({ label = "Shuffle questions" }) {
  const [active, setActive] = useState(true);
  return (
    <button
      className={`ui-toggle${active ? " is-active" : ""}`}
      onClick={() => setActive((prev) => !prev)}
      type="button"
    >
      {label}
    </button>
  );
}
