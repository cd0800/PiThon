export function InputGroup({
  label = "Search",
  helper = "Press Enter or click Search.",
  buttonLabel = "Search",
  placeholder = "Search assignments",
}) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <div className="ui-input-group">
        <input className="ui-input" type="search" placeholder={placeholder} />
        <button className="ui-input-button" type="button">
          {buttonLabel}
        </button>
      </div>
      <div className="ui-input-helper">{helper}</div>
    </div>
  );
}
