export function Progress({ value = 58 }) {
  return (
    <div className="ui-progress">
      <div className="ui-progress-bar" style={{ width: `${value}%` }} />
      <span>{value}%</span>
    </div>
  );
}
