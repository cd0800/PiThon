export function Badge({ label = "Active", variant = "solid" }) {
  return (
    <span className="ui-badge" data-variant={variant}>
      {label}
    </span>
  );
}
