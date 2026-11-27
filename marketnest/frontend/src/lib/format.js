export function money(value) {
  const number = Number(value) || 0;
  return `₦${number.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function shortMoney(value) {
  const number = Number(value) || 0;
  if (number >= 1_000_000) return `₦${(number / 1_000_000).toFixed(1)}m`;
  if (number >= 1_000) return `₦${(number / 1_000).toFixed(number >= 10_000 ? 0 : 1)}k`;
  return money(number);
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm || `${singular}s`;
}

export function formatDate(value, options = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function timeAgo(value) {
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return String(value || "");
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}
