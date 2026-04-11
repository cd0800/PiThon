export function Switch({ label = "Allow retakes" }) {
  return (
    <label className="ui-switch">
      <input type="checkbox" defaultChecked />
      <span className="ui-switch-track">
        <span className="ui-switch-thumb" />
      </span>
      <span>{label}</span>
    </label>
  );
}
