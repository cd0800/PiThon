export function DropdownMenu({
  label = "More actions",
  items = ["Duplicate", "Assign", "Delete"],
}) {
  return (
    <details className="ui-dropdown">
      <summary className="ui-dropdown-trigger">{label}</summary>
      <div className="ui-dropdown-menu" role="menu">
        {items.map((item) => (
          <button key={item} className="ui-dropdown-item" type="button">
            {item}
          </button>
        ))}
      </div>
    </details>
  );
}
