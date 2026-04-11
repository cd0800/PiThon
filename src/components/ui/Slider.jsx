export function Slider({ value = 70 }) {
  return (
    <div className="ui-slider">
      <input type="range" defaultValue={value} />
      <span>{value}</span>
    </div>
  );
}
