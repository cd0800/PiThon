import { useMemo, useState } from "react";

export function Sidebar({ items = ["Overview", "Assignments", "Grades"] }) {
  const [collapsed, setCollapsed] = useState(false);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => {
        if (typeof item === "string") {
          const label = item;
          return { label, icon: label.slice(0, 1).toUpperCase() };
        }
        const label = item.label ?? item.text ?? "Item";
        return {
          label,
          icon: item.icon ?? label.slice(0, 1).toUpperCase(),
          href: item.href ?? "#",
          current: Boolean(item.current),
        };
      }),
    [items]
  );

  return (
    <aside className={`ui-sidebar${collapsed ? " is-collapsed" : ""}`}>
      <button
        type="button"
        className="ui-sidebar-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="ui-sidebar-toggle-bar" />
        <span className="ui-sidebar-toggle-bar" />
        <span className="ui-sidebar-toggle-bar" />
      </button>
      <nav className="ui-sidebar-nav">
        {normalizedItems.map((item) => (
          <a
            key={item.label}
            aria-current={item.current ? "page" : undefined}
            className="ui-sidebar-link"
            href={item.href}
          >
            <span className="ui-sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>
            {!collapsed && (
              <span className="ui-sidebar-text">{item.label}</span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
}
