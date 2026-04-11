export function NavigationMenu({ items = ["Dashboard", "Classes", "Reports"] }) {
  return (
    <nav className="ui-navigation">
      {items.map((item) => (
        <a key={item} href="#">
          {item}
        </a>
      ))}
    </nav>
  );
}
