export function Popover({ label = "Show hints" }) {
  return (
    <details className="ui-popover">
      <summary className="ui-popover-trigger">{label}</summary>
      <div className="ui-popover-panel">
        Give students a nudge without revealing the answer.
      </div>
    </details>
  );
}
