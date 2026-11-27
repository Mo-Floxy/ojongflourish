const palettes = [
  ["#d9f2ee", "#0f766e"],
  ["#e0f2fe", "#0284c7"],
  ["#fef3c7", "#f59e0b"],
  ["#ede9fe", "#7c3aed"],
  ["#ffedd5", "#f97316"],
  ["#ccfbf1", "#14b8a6"],
  ["#e2e8f0", "#475569"],
  ["#fce7f3", "#db2777"],
];

function paletteFor(mark = "") {
  let total = 0;
  for (const char of String(mark)) total += char.charCodeAt(0);
  return palettes[total % palettes.length];
}

export default function Thumb({ src, alt = "", mark = "M", className = "", style, children }) {
  const [from, to] = paletteFor(mark || alt);
  return (
    <div
      className={`thumb ${className}`.trim()}
      style={
        src
          ? style
          : {
              background: `linear-gradient(140deg, ${from}, ${to})`,
              ...style,
            }
      }
    >
      {src ? <img src={src} alt={alt} /> : <span className="thumb-mark">{mark}</span>}
      {children}
    </div>
  );
}
