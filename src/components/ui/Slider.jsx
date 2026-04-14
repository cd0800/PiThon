import { useState } from "react";

export function Slider({ value = 70, min = 0, max = 100, step = 1 }) {
  const [current, setCurrent] = useState(value);

  return (
    <div className="ui-slider">
      <input
        className="ui-slider-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => setCurrent(Number(event.target.value))}
      />
      <span className="ui-slider-value">{current}</span>
    </div>
  );
}
