export function Tooltip({ label = "Hover me", tooltip = "Due in 3 days" }) {
  return (
    <span className="ui-tooltip" data-tooltip={tooltip}>
      {label}
    </span>
  );
}
