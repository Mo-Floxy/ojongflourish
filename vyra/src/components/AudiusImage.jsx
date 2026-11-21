import { useEffect, useMemo, useState } from "react";
import { artworkMeta } from "../services/audius";

const DEFAULT_FALLBACK = "/images/covers/genre-afrobeats.jpg";

// Audius returns artwork mirrors on other hosts. Keep the original path and
// swap only the host so a blocked/failed CDN can be retried elsewhere.
function mirrorUrls(src, mirrors = []) {
  if (!src || !Array.isArray(mirrors) || mirrors.length === 0) return [];

  let original;
  try {
    original = new URL(src);
  } catch {
    return [];
  }

  const urls = [];
  const originalValue = original.toString();

  mirrors.forEach((mirror) => {
    if (typeof mirror !== "string" || !mirror) return;
    try {
      const next = new URL(originalValue);
      next.host = new URL(mirror).host;
      const value = next.toString();
      if (value !== originalValue && !urls.includes(value)) urls.push(value);
    } catch {
      // Ignore malformed mirror entries and keep trying the remaining ones.
    }
  });

  return urls;
}

export default function AudiusImage({
  artwork,
  alt = "",
  className = "",
  fallback = DEFAULT_FALLBACK,
  size = "480x480",
}) {
  const candidates = useMemo(() => {
    const meta = artworkMeta(artwork, size);
    const urls = [];

    if (meta.src && !urls.includes(meta.src)) urls.push(meta.src);
    mirrorUrls(meta.src, meta.mirrors).forEach((url) => {
      if (!urls.includes(url)) urls.push(url);
    });
    if (fallback && !urls.includes(fallback)) urls.push(fallback);

    return urls.length ? urls : [DEFAULT_FALLBACK];
  }, [artwork, size, fallback]);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [candidates]);

  const currentSrc = candidates[Math.min(attempt, candidates.length - 1)] || DEFAULT_FALLBACK;

  const handleError = () => {
    setAttempt((value) => Math.min(value + 1, candidates.length - 1));
  };

  return (
    <img
      className={`audius-img ${className}`.trim()}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
    />
  );
}
