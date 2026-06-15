export function Field({ label = "Assignment title" }) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input className="ui-input" placeholder="Intro to functions" />
    </div>
  );
}
