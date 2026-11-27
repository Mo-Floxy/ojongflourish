import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import AuthShell from './AuthShell';

const INITIAL = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8 || !/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      setError('Use at least 8 characters with an uppercase letter, a lowercase letter and a number.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create your space"
      title="Your intelligence starts here."
      description="A private workspace for conversations, images, voice and everything you imagine."
      state="processing"
    >
      <form className="nx-auth-form" onSubmit={submit}>
        {error && <div className="nx-alert">{error}</div>}

        <div className="nx-auth-form__two">
          <label className="nx-field">
            <span className="nx-label">First name</span>
            <span className="nx-input-wrap"><UserRound size={16} />
              <input className="nx-input" value={form.firstName} onChange={set('firstName')} placeholder="Ada" required />
            </span>
          </label>
          <label className="nx-field">
            <span className="nx-label">Last name</span>
            <span className="nx-input-wrap"><UserRound size={16} />
              <input className="nx-input" value={form.lastName} onChange={set('lastName')} placeholder="Lovelace" required />
            </span>
          </label>
        </div>

        <label className="nx-field">
          <span className="nx-label">Email address</span>
          <span className="nx-input-wrap"><Mail size={16} />
            <input className="nx-input" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </span>
        </label>

        <label className="nx-field">
          <span className="nx-label">Password</span>
          <span className="nx-input-wrap"><LockKeyhole size={16} />
            <input className="nx-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required />
            <button type="button" className="nx-input-wrap__action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <label className="nx-field">
          <span className="nx-label">Confirm password</span>
          <span className="nx-input-wrap"><LockKeyhole size={16} />
            <input className="nx-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" required />
          </span>
        </label>

        <button className="nx-btn nx-btn--primary nx-auth-form__submit" disabled={submitting}>
          {submitting ? <span className="nx-spinner" /> : <><ArrowRight size={17} /> Create Account</>}
        </button>
      </form>

      <p className="nx-auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
