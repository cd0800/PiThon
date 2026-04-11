export function ContextMenu({
  label = "Right click",
  items = ["Duplicate", "Share", "Archive"],
}) {
  return (
    <details className="ui-context">
      <summary className="ui-context-trigger">{label}</summary>
      <div className="ui-context-menu" role="menu">
        {items.map((item) => (
          <button key={item} className="ui-context-item" type="button">
            {item}
          </button>
        ))}
      </div>
    </details>
  );
}
