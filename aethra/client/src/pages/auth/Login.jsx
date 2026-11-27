import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import AuthShell from './AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from?.pathname || '/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your universe."
      description="Your conversations, creations and ideas are right where you left them."
    >
      <form className="nx-auth-form" onSubmit={submit}>
        {location.state?.notice && <div className="nx-alert nx-alert--success">{location.state.notice}</div>}
        {error && <div className="nx-alert">{error}</div>}

        <label className="nx-field">
          <span className="nx-label">Email address</span>
          <span className="nx-input-wrap">
            <Mail size={16} />
            <input
              className="nx-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </span>
        </label>

        <label className="nx-field">
          <span className="nx-label">Password</span>
          <span className="nx-input-wrap">
            <LockKeyhole size={16} />
            <input
              className="nx-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" className="nx-input-wrap__action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <div className="nx-auth-form__row">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button className="nx-btn nx-btn--primary nx-auth-form__submit" disabled={submitting}>
          {submitting ? <span className="nx-spinner" /> : <><ArrowRight size={17} /> Sign In</>}
        </button>
      </form>

      <p className="nx-auth-switch">
        New to AETHRA? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
