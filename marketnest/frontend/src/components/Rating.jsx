import { Star } from "lucide-react";

export default function Rating({ value = 0, count, size = 14 }) {
  return (
    <span className="rating" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(value) ? "currentColor" : "none"}
          opacity={star <= Math.round(value) ? 1 : 0.35}
        />
      ))}
      {count !== undefined && <span className="rating-count">({count})</span>}
    </span>
  );
}
