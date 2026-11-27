import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import AuthShell from './AuthShell';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This reset link is missing its token.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      navigate('/login', { state: { notice: 'Password updated. Sign in with your new password.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure recovery"
      title="Choose a new password."
      description="Use a strong password you haven't used on AETHRA before."
    >
      <form className="nx-auth-form" onSubmit={submit}>
        {error && <div className="nx-alert">{error}</div>}
        <label className="nx-field">
          <span className="nx-label">New password</span>
          <span className="nx-input-wrap"><LockKeyhole size={16} />
            <input className="nx-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </span>
        </label>
        <label className="nx-field">
          <span className="nx-label">Confirm password</span>
          <span className="nx-input-wrap"><LockKeyhole size={16} />
            <input className="nx-input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </span>
        </label>
        <button className="nx-btn nx-btn--primary nx-auth-form__submit" disabled={submitting}>
          {submitting ? <span className="nx-spinner" /> : <><ArrowRight size={17} /> Update Password</>}
        </button>
      </form>
      <p className="nx-auth-switch"><Link to="/login">← Back to sign in</Link></p>
    </AuthShell>
  );
}
