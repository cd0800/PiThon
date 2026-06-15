export function Checkbox({ label = "Require calculator" }) {
  return (
    <label className="ui-checkbox">
      <input type="checkbox" defaultChecked />
      <span>{label}</span>
    </label>
  );
}
