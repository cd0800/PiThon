export function AspectRatio({ ratio = 16 / 9, children }) {
  return (
    <div className="ui-aspect" style={{ "--ratio": ratio }}>
      <div className="ui-aspect-box" />
      <div className="ui-aspect-content">{children}</div>
    </div>
  );
}
