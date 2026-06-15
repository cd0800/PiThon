export function Empty({
  title = "No assignments yet",
  description = "Start by creating your first class assignment.",
}) {
  return (
    <div className="ui-empty">
      <div className="ui-empty-icon">0</div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
