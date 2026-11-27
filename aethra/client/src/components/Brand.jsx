import { Link } from 'react-router-dom';

export function BrandMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="brand-mark">
      <defs>
        <radialGradient id="AETHRA-core" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#e0f6ff" />
          <stop offset="32%" stopColor="#4da3ff" />
          <stop offset="70%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#0b1024" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="16" fill="url(#AETHRA-core)" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#60a5fa" strokeOpacity="0.42" />
      <ellipse cx="32" cy="32" rx="29" ry="10" fill="none" stroke="#a78bfa" strokeOpacity="0.48" transform="rotate(-24 32 32)" />
      <circle cx="52" cy="18" r="2.2" fill="#22d3ee" />
    </svg>
  );
}

export default function Brand({ to = '/', compact = false }) {
  return (
    <Link to={to} className="nx-brand" aria-label="AETHRA home">
      <BrandMark size={compact ? 30 : 36} />
      <span className="nx-brand__word">
        AETHRA
        <small>ai universe</small>
      </span>
    </Link>
  );
}
