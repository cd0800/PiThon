export function Dialog({
  title = "Share assignment",
  description = "Invite students with a class code.",
  action = "Send invite",
}) {
  return (
    <div className="ui-dialog" role="dialog">
      <div className="ui-dialog-header">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <div className="ui-dialog-actions">
        <button className="ui-button ui-button-secondary">Cancel</button>
        <button className="ui-button ui-button-primary">{action}</button>
      </div>
    </div>
  );
}
