const palettes = [
  ["#F8F3EB", "#D9B7E8"],
  ["#FFFFFF", "#D9B7E8"],
  ["#F8F3EB", "#F07842"],
  ["#D9B7E8", "#FFFFFF"],
  ["#FFFFFF", "#F8F3EB"],
  ["#F8F3EB", "#FFFFFF"],
  ["#D9B7E8", "#F8F3EB"],
  ["#FFFFFF", "#F07842"],
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
