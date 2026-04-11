export function Select({
  label = "Grade level",
  options = ["9", "10", "11", "12"],
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
