export function AlertDialog({
  title = "Delete assignment?",
  description = "This cannot be undone once confirmed.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) {
  return (
    <div className="ui-dialog" data-variant="alert" role="alertdialog">
      <div className="ui-dialog-header">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <div className="ui-dialog-actions">
        <button className="ui-button ui-button-ghost">{cancelLabel}</button>
        <button className="ui-button ui-button-danger">{confirmLabel}</button>
      </div>
    </div>
  );
}
