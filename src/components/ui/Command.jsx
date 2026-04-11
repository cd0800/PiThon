import { defaultCommandItems } from "./data";

export function Command({ items = defaultCommandItems }) {
  return (
    <div className="ui-command">
      <input className="ui-input" placeholder="Type a command" />
      <div className="ui-command-list">
        {items.map((item) => (
          <button key={item} className="ui-command-item" type="button">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
