import { useId } from 'react';
import { Link } from 'react-router-dom';

export default function Brand({ withTagline = false }) {
  const gradientId = useId().replace(/:/g, '');
  return (
    <Link className="brand" to="/" aria-label="EDVANTA home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="38" height="38">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7047EB" />
              <stop offset="1" stopColor="#35B8E8" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="#171334" />
          <path d="M13 13h23v6H20v6h14v6H20v7h-7V13z" fill={`url(#${gradientId})`} />
          <circle cx="35" cy="35" r="3" fill="#FFB86B" />
        </svg>
      </span>
      <span className="brand-text">
        EDVANTA
        {withTagline && <small>Learn Without Limits.</small>}
      </span>
    </Link>
  );
}
