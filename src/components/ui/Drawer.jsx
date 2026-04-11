import { Button } from "./Button";

export function Drawer({ title = "Student list" }) {
  return (
    <div className="ui-drawer" role="dialog">
      <strong>{title}</strong>
      <p>Pulls up from the bottom on mobile.</p>
      <Button size="sm">View roster</Button>
    </div>
  );
}
