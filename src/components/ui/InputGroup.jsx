export function InputGroup({ prefix = "Score", suffix = "%" }) {
  return (
    <div className="ui-input-group">
      <span className="ui-input-prefix">{prefix}</span>
      <input className="ui-input" placeholder="85" />
      <span className="ui-input-suffix">{suffix}</span>
    </div>
  );
}
