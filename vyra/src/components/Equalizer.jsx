const STATIC_PATTERNS = [
  [42, 78, 56, 92, 64, 38, 84, 52, 70, 46, 88, 58, 74, 40, 66],
  [58, 34, 80, 52, 96, 44, 68, 86, 50, 72, 38, 90, 60, 76, 46],
  [70, 48, 92, 60, 36, 82, 54, 74, 44, 88, 64, 40, 78, 56, 94],
];

export default function Equalizer({
  bars = 5,
  animated = true,
  variant = 0,
  className = "",
  barWidth = 3,
}) {
  const pattern = STATIC_PATTERNS[variant % STATIC_PATTERNS.length];
  return (
    <span
      className={`eq ${animated ? "eq--animate" : ""} ${className}`}
      aria-hidden="true"
      style={{ "--bar-w": `${barWidth}px` }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="eq__bar"
          style={{
            "--h": `${pattern[i % pattern.length]}%`,
            "--delay": `${(i % 7) * 0.13}s`,
            "--dur": `${0.9 + (i % 5) * 0.22}s`,
          }}
        />
      ))}
    </span>
  );
}
