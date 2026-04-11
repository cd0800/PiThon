import { useState } from "react";
import { defaultCarouselItems } from "./data";

export function Carousel({ items = defaultCarouselItems }) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const next = () => setIndex((prev) => (prev + 1) % count);
  const prev = () => setIndex((prev) => (prev - 1 + count) % count);

  return (
    <div className="ui-carousel">
      <div className="ui-carousel-window">{items[index]}</div>
      <div className="ui-carousel-controls">
        <button className="ui-button ui-button-ghost" onClick={prev}>
          Prev
        </button>
        <button className="ui-button ui-button-ghost" onClick={next}>
          Next
        </button>
      </div>
    </div>
  );
}
