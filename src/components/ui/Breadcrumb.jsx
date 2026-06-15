import { defaultBreadcrumb } from "./data";

export function Breadcrumb({ items = defaultBreadcrumb }) {
  return (
    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            <a href={item.href}>{item.label}</a>
            {index < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
