export function Button({
  children = "Button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`ui-button ui-button-${variant} ui-button-${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
