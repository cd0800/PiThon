export function Button({
  children = "Button",
  variant = "primary",
  size = "md",
}) {
  return (
    <button className={`ui-button ui-button-${variant} ui-button-${size}`}>
      {children}
    </button>
  );
}
