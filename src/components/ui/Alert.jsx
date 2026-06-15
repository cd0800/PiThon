export function Alert({
  title = "Heads up",
  description = "This is a friendly alert message.",
  variant = "info",
}) {
  return (
    <div className="ui-alert" data-variant={variant} role="alert">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
