export function Avatar({ name = "Ada Lovelace", src = "", size = "md" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`ui-avatar ui-avatar-${size}`} aria-label={name}>
      {src ? <img src={src} alt={name} /> : <span>{initials}</span>}
    </div>
  );
}
