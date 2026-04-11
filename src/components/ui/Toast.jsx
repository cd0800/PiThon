export function Toast({
  title = "Draft saved",
  description = "We saved changes to your assignment.",
}) {
  return (
    <div className="ui-toast">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
