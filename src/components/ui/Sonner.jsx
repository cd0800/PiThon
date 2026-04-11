import { defaultSonnerItems } from "./data";

export function Sonner({ items = defaultSonnerItems }) {
  return (
    <div className="ui-sonner">
      {items.map((item) => (
        <div key={item.title} className="ui-toast">
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </div>
      ))}
    </div>
  );
}
