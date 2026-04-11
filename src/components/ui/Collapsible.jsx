export function Collapsible({
  title = "Show solutions",
  content = "Reveal step-by-step hints for students.",
}) {
  return (
    <details className="ui-collapsible">
      <summary>{title}</summary>
      <div className="ui-collapsible-content">{content}</div>
    </details>
  );
}
