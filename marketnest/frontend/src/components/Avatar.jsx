import { initials } from "../lib/format";

export default function Avatar({ name = "", src, size = 38, className = "" }) {
  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.max(11, size / 2.8) }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} /> : initials(name)}
    </span>
  );
}
