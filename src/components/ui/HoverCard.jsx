export function HoverCard({
  label = "Hover to preview",
  content = "Quick summary of the assignment.",
}) {
  return (
    <div className="ui-hover-card">
      <span>{label}</span>
      <div className="ui-hover-panel">{content}</div>
    </div>
  );
}
