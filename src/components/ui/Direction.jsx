export function Direction() {
  return (
    <div className="ui-direction" aria-label="Direction pad">
      <button className="ui-direction-btn" type="button">
        Up
      </button>
      <div className="ui-direction-row">
        <button className="ui-direction-btn" type="button">
          Left
        </button>
        <button className="ui-direction-btn" type="button">
          Right
        </button>
      </div>
      <button className="ui-direction-btn" type="button">
        Down
      </button>
    </div>
  );
}
