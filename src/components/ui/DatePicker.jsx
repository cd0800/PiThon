export function DatePicker({ label = "Due date" }) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input className="ui-input" type="date" />
    </div>
  );
}
