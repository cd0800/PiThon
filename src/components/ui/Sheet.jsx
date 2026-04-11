import { Button } from "./Button";

export function Sheet({ title = "Filters" }) {
  return (
    <div className="ui-sheet">
      <strong>{title}</strong>
      <p>Slide-over panel for quick adjustments.</p>
      <Button size="sm" variant="secondary">
        Apply
      </Button>
    </div>
  );
}
