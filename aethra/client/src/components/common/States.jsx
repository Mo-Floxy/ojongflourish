import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="nx-page-header">
      <div>
        {eyebrow && <span className="nx-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p className="nx-muted">{description}</p>}
      </div>
      {actions && <div className="nx-page-header__actions">{actions}</div>}
    </header>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="nx-state">
      <span className="nx-spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="nx-state nx-state--error">
      <AlertTriangle size={28} />
      <h3>Something interrupted the signal</h3>
      <p>{message}</p>
      {onRetry && <button className="nx-btn nx-btn--ghost nx-btn--sm" onClick={onRetry}><RefreshCw size={15} /> Try again</button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <div className="nx-state nx-state--empty">
      <span className="nx-state__icon"><Icon size={26} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SetupNotice({ title = 'Setup required', message, icon: Icon = Sparkles }) {
  return (
    <div className="nx-setup-notice nx-glass">
      <span className="nx-setup-notice__icon"><Icon size={24} /></span>
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
        <p className="nx-muted">Add the credentials to <code>server/.env</code> and restart the API. No simulated results are shown.</p>
      </div>
    </div>
  );
}
