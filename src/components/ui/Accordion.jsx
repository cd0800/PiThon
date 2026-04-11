import { defaultAccordionItems } from "./data";

export function Accordion({ items = defaultAccordionItems }) {
  return (
    <div className="ui-accordion">
      {items.map((item, index) => (
        <details
          key={item.title}
          className="ui-accordion-item"
          open={index === 0}
        >
          <summary>{item.title}</summary>
          <div className="ui-accordion-content">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
