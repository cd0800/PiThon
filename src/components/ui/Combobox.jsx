import { useId, useMemo, useState } from "react";

export function Combobox({
  label = "Search topic",
  options = ["Algebra", "Geometry", "Statistics"],
}) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((option) =>
      option.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div className="ui-field ui-combobox">
      <label className="ui-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className="ui-input"
        id={inputId}
        placeholder="Type to search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      <div className="ui-combobox-list" id={listId} role="listbox">
        {filtered.length ? (
          filtered.map((option) => (
            <button
              key={option}
              type="button"
              className="ui-combobox-option"
              onClick={() => setQuery(option)}
              role="option"
            >
              {option}
            </button>
          ))
        ) : (
          <div className="ui-combobox-empty">No matches found.</div>
        )}
      </div>
    </div>
  );
}
