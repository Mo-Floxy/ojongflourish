export function PageSpinner({ label = "Loading" }) {
  return (
    <div className="page-spinner" role="status">
      <span className="spinner" />
      <span>{label}…</span>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: "4 / 3.4", borderRadius: 0 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ width: "45%", height: 10, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: "85%", height: 18, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: "35%", height: 14 }} />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <p>{message || "We couldn't load this right now."}</p>
      {onRetry && <button type="button" className="mn-btn sm ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}
