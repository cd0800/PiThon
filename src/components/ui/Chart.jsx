import { defaultChartData } from "./data";

export function Chart({
  data = defaultChartData,
  title = "Score trend",
  timeframe = "Last 3 months",
}) {
  if (!data || !data.length) {
    return <div className="ui-chart-empty">No chart data available.</div>;
  }

  const max = Math.max(...data.map((entry) => entry.value));

  return (
    <div className="ui-chart-wrapper">
      <header className="ui-chart-header">
        <div className="ui-chart-title">{title}</div>
        <div className="ui-chart-timeframe">{timeframe}</div>
      </header>
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
    </div>
  );
}
