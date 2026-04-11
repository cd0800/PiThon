export function Sidebar({ items = ["Overview", "Assignments", "Grades"] }) {
  return (
    <aside className="ui-sidebar">
      {items.map((item) => (
        <a key={item} href="#">
          {item}
        </a>
      ))}
    </aside>
  );
}
