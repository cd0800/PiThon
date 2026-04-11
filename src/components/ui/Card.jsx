import { Button } from "./Button";

export function Card({ title = "Assignment", body = "Quadratic equations set." }) {
  return (
    <div className="ui-card">
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <Button size="sm" variant="secondary">
        Open
      </Button>
    </div>
  );
}
