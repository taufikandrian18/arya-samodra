// Digits roll up into place like an odometer; non-digits sit still.
// Decorative: the value is announced once through `label`.
const DIGITS = [...'01234567890123456789'];

export default function Odometer({ value, label, className = '' }) {
  const chars = [...String(value)];
  return (
    <span className={`odometer inline-flex ${className}`}>
      <span className="sr-only">{label ?? value}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((c, i) =>
          /\d/.test(c) ? (
            <span key={i} className="odo-window">
              <span className="odo-reel" style={{ '--to': Number(c) + 10, '--i': i }}>
                {DIGITS.map((d, j) => (
                  <span key={j} className="block">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{c}</span>
          )
        )}
      </span>
    </span>
  );
}
