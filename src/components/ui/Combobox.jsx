export function Combobox({
  label = "Search topic",
  options = ["Algebra", "Geometry", "Statistics"],
}) {
  const listId = "combobox-options";
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={listId}>
        {label}
      </label>
      <input
        className="ui-input"
        id={listId}
        list={listId}
        placeholder="Type to search"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}
