export function LogoLockup({
  src = "/pithon-logo-lockup.png",
  alt = "PiThon logo",
}) {
  return (
    <div className="ui-logo-lockup">
      <img src={src} alt={alt} />
    </div>
  );
}
