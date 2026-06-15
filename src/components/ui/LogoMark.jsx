export function LogoMark({
  src = "/pithon-logo-mark.png",
  alt = "PiThon logo mark",
}) {
  return (
    <div className="ui-logo-mark">
      <img src={src} alt={alt} />
    </div>
  );
}
