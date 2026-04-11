export function ScrollArea({
  items = [
    "Linear equations",
    "Quadratics",
    "Polynomials",
    "Rational expressions",
    "Exponents",
  ],
}) {
  return (
    <div className="ui-scroll-area">
      {items.map((item) => (
        <div key={item} className="ui-item">
          {item}
        </div>
      ))}
    </div>
  );
}
