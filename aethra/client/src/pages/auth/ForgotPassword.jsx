import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      setResult(await api('/auth/forgot-password', { method: 'POST', body: { email } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      description="Enter the email linked to your account and we'll prepare a secure reset link."
    >
      {result ? (
        <div className="nx-auth-result">
          <div className="nx-alert nx-alert--success">{result.message}</div>
          {result.devResetToken && (
            <div className="nx-alert nx-alert--info">
              <strong>Local development mode</strong>
              <p>No email was sent. Use this one-time link:</p>
              <Link to={`/reset-password?token=${result.devResetToken}`}>Open password reset →</Link>
            </div>
          )}
          <Link to="/login" className="nx-btn nx-btn--ghost nx-btn--sm">Back to sign in</Link>
        </div>
      ) : (
        <form className="nx-auth-form" onSubmit={submit}>
          {error && <div className="nx-alert">{error}</div>}
          <label className="nx-field">
            <span className="nx-label">Email address</span>
            <span className="nx-input-wrap"><Mail size={16} />
              <input className="nx-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </span>
          </label>
          <button className="nx-btn nx-btn--primary nx-auth-form__submit" disabled={submitting}>
            {submitting ? <span className="nx-spinner" /> : <><ArrowRight size={17} /> Send Reset Link</>}
          </button>
        </form>
      )}
      <p className="nx-auth-switch"><Link to="/login">← Back to sign in</Link></p>
    </AuthShell>
  );
}
