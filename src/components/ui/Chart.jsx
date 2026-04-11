import { defaultChartData } from "./data";

export function Chart({ data = defaultChartData }) {
  const max = Math.max(...data.map((entry) => entry.value));

  return (
    <div className="ui-chart">
      {data.map((entry) => (
        <div key={entry.label} className="ui-chart-item">
          <div
            className="ui-chart-bar"
            style={{ height: `${(entry.value / max) * 100}%` }}
          />
          <span>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}
