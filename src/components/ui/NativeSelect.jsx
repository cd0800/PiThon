export function NativeSelect({
  label = "Class period",
  options = ["Period 1", "Period 2", "Period 3"],
}) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <select className="ui-select">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
