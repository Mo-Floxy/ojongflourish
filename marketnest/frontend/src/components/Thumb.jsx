const palettes = [
  ["#DBEAFE", "#2563EB"],
  ["#EFF6FF", "#1D4ED8"],
  ["#FEF3C7", "#D97706"],
  ["#E2E8F0", "#172554"],
  ["#DBEAFE", "#2563EB"],
  ["#D1FAE5", "#10B981"],
  ["#F1F5F9", "#64748B"],
  ["#FEF3C7", "#F59E0B"],
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
