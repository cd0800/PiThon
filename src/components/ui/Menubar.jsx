export function Menubar({ items = ["File", "Edit", "View"] }) {
  return (
    <nav className="ui-menubar">
      {items.map((item) => (
        <button key={item} className="ui-menubar-item" type="button">
          {item}
        </button>
      ))}
    </nav>
  );
}
