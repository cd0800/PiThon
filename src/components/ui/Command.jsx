import { useMemo, useState } from "react";
import { defaultCommandItems } from "./data";

export function Command({ items = defaultCommandItems }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }
    return items.filter((item) => item.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div className="ui-command">
      <input
        className="ui-input"
        placeholder="Type a command"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search commands"
      />
      <div className="ui-command-panel" role="menu">
        {filtered.length ? (
          filtered.map((item) => (
            <button key={item} className="ui-command-item" type="button">
              {item}
            </button>
          ))
        ) : (
          <div className="ui-command-empty">No commands found.</div>
        )}
      </div>
    </div>
  );
}
