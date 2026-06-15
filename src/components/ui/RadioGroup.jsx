export function RadioGroup({
  options = ["Multiple choice", "Short answer", "Free response"],
}) {
  return (
    <div className="ui-radio-group">
      {options.map((option, index) => (
        <label key={option}>
          <input
            type="radio"
            name="question-type"
            defaultChecked={index === 0}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
