import { useState } from "react";
import { defaultToggleOptions } from "./data";

export function ToggleGroup({ options = defaultToggleOptions }) {
  const [active, setActive] = useState(options[1]);
  return (
    <div className="ui-toggle-group">
      {options.map((option) => (
        <button
          key={option}
          className={`ui-toggle${active === option ? " is-active" : ""}`}
          onClick={() => setActive(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
