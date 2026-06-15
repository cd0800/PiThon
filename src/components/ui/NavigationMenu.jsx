export function NavigationMenu({ items = ["Dashboard", "Classes", "Reports"] }) {
  return (
    <nav className="ui-navigation">
      {items.map((item) => {
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? "#" : item.href;
        const current = typeof item === "string" ? false : item.current;

        return (
          <a key={label} href={href} aria-current={current ? "page" : undefined}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}
