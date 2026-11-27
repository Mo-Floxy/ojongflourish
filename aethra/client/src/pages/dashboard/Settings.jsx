import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  KeyRound,
  Loader2,
  Palette,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Volume2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/States';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'voice', label: 'Voice', icon: Volume2 },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const ACCENTS = [
  { value: 'blue', color: '#3b82f6' },
  { value: 'violet', color: '#8b5cf6' },
  { value: 'cyan', color: '#22d3ee' },
  { value: 'rose', color: '#f43f5e' },
  { value: 'amber', color: '#f59e0b' },
];

const THEMES = [
  { value: 'midnight', label: 'Midnight' },
  { value: 'dark', label: 'Deep dark' },
  { value: 'aurora', label: 'Aurora' },
];

function Toggle({ label, description, checked, onChange, icon: Icon }) {
  return (
    <label className="nx-toggle-row">
      <span className="nx-toggle-row__icon">{Icon && <Icon size={17} />}</span>
      <span className="nx-toggle-row__copy"><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span className="nx-toggle" aria-hidden="true"><i /></span>
    </label>
  );
}

export default function Settings() {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', avatarColor: 'blue' });
  const [prefs, setPrefs] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [voices, setVoices] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);

  const applyPreferences = useCallback((values) => {
    document.documentElement.dataset.theme = values.theme || 'midnight';
    document.documentElement.dataset.accent = values.accent || 'blue';
    document.documentElement.classList.toggle('nx-reduced-motion', Boolean(values.reducedMotion));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api('/settings');
      setData(result);
      setProfile({
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        avatarColor: result.user.avatarColor,
      });
      setPrefs(result.preferences);
      applyPreferences(result.preferences);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applyPreferences]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const readVoices = () => setVoices(window.speechSynthesis.getVoices());
    readVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', readVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', readVoices);
  }, []);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 4000);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy('profile');
    setError('');
    try {
      const result = await api('/settings/profile', { method: 'PATCH', body: profile });
      setData((current) => ({ ...current, user: result.user }));
      updateUser(result.user);
      flash('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    setBusy('preferences');
    setError('');
    try {
      const payload = {
        ...prefs,
        voiceRate: Number(prefs.voiceRate),
        voicePitch: Number(prefs.voicePitch),
      };
      const result = await api('/settings/preferences', { method: 'PATCH', body: payload });
      setPrefs(result.preferences);
      applyPreferences(result.preferences);
      flash('Preferences saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (passwords.newPassword.length < 8 || !/[a-z]/.test(passwords.newPassword) || !/[A-Z]/.test(passwords.newPassword) || !/\d/.test(passwords.newPassword)) {
      setError('Use at least 8 characters with uppercase, lowercase and a number.');
      return;
    }

    setBusy('password');
    try {
      await api('/settings/password', {
        method: 'POST',
        body: { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      });
      await logout();
      navigate('/login', { replace: true, state: { notice: 'Password updated. Please sign in again.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <LoadingState label="Opening your settings…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="nx-settings">
      <PageHeader
        eyebrow="Settings"
        title="Make AETHRA yours."
        description="Tune your profile, privacy and voice to match the way you work."
      />

      {notice && <div className="nx-alert nx-alert--success nx-settings__notice"><Check size={15} /> {notice}</div>}
      {error && data && <div className="nx-alert nx-settings__notice">{error}</div>}

      <div className="nx-settings__layout">
        <nav className="nx-glass nx-settings__tabs" aria-label="Settings sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
              <Icon size={17} /> {label}
            </button>
          ))}
          <div className="nx-settings__account nx-mono">
            <span>ACCOUNT</span>
            <strong>{data.user.email}</strong>
            <small>Member since {new Date(data.user.createdAt).toLocaleDateString()}</small>
          </div>
        </nav>

        <div className="nx-settings__content">
          {tab === 'profile' && (
            <motion.form className="nx-glass nx-panel nx-settings__panel" onSubmit={saveProfile} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="nx-panel__head"><div><h2>Profile</h2><p className="nx-muted">How you appear inside AETHRA.</p></div></div>
              <div className="nx-settings__avatar-preview">
                <span style={{ background: `linear-gradient(135deg, ${profile.avatarColor}, #0b1024)` }}>
                  {profile.firstName?.[0] || 'A'}{profile.lastName?.[0] || 'E'}
                </span>
                <div><strong>{data.user.fullName}</strong><small>{data.user.email}</small></div>
              </div>
              <div className="nx-settings__two">
                <label className="nx-field"><span className="nx-label">First name</span><input className="nx-input" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} required /></label>
                <label className="nx-field"><span className="nx-label">Last name</span><input className="nx-input" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} required /></label>
              </div>
              <div className="nx-field">
                <span className="nx-label">Accent colour</span>
                <div className="nx-settings__accents">
                  {ACCENTS.map((accent) => (
                    <button type="button" key={accent.value} className={profile.avatarColor === accent.value ? 'is-active' : ''} style={{ '--swatch': accent.color }} onClick={() => setProfile({ ...profile, avatarColor: accent.value })} aria-label={`Use ${accent.value} accent`} aria-pressed={profile.avatarColor === accent.value}>
                      {profile.avatarColor === accent.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <button className="nx-btn nx-btn--primary nx-settings__save" disabled={busy === 'profile'}>
                {busy === 'profile' ? <Loader2 size={16} className="nx-spin" /> : <Save size={16} />} Save profile
              </button>
            </motion.form>
          )}

          {tab === 'preferences' && (
            <motion.form className="nx-glass nx-panel nx-settings__panel" onSubmit={savePreferences} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="nx-panel__head"><div><h2>Preferences</h2><p className="nx-muted">Appearance and workspace behaviour.</p></div></div>

              <div className="nx-field">
                <span className="nx-label"><Palette size={14} /> Interface theme</span>
                <div className="nx-settings__themes">
                  {THEMES.map((theme) => (
                    <button type="button" key={theme.value} className={prefs.theme === theme.value ? 'is-active' : ''} onClick={() => setPrefs({ ...prefs, theme: theme.value })}>
                      <span className={`nx-theme-swatch nx-theme-swatch--${theme.value}`} /> {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nx-field">
                <span className="nx-label">Accent colour</span>
                <div className="nx-settings__accents">
                  {ACCENTS.map((accent) => (
                    <button type="button" key={accent.value} className={prefs.accent === accent.value ? 'is-active' : ''} style={{ '--swatch': accent.color }} onClick={() => setPrefs({ ...prefs, accent: accent.value })} aria-label={`Use ${accent.value} accent`} aria-pressed={prefs.accent === accent.value}>
                      {prefs.accent === accent.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nx-settings__toggles">
                <Toggle icon={Bell} label="Email notifications" description="Receive product and security updates." checked={prefs.emailNotifications} onChange={(value) => setPrefs({ ...prefs, emailNotifications: value })} />
                <Toggle icon={Save} label="Auto-save generated images" description="Add every generated image to My Creations." checked={prefs.autoSaveImages} onChange={(value) => setPrefs({ ...prefs, autoSaveImages: value })} />
                <Toggle icon={SlidersHorizontal} label="Reduced motion" description="Minimise interface animation where possible." checked={prefs.reducedMotion} onChange={(value) => setPrefs({ ...prefs, reducedMotion: value })} />
              </div>

              <button className="nx-btn nx-btn--primary nx-settings__save" disabled={busy === 'preferences'}>
                {busy === 'preferences' ? <Loader2 size={16} className="nx-spin" /> : <Save size={16} />} Save preferences
              </button>
            </motion.form>
          )}

          {tab === 'voice' && (
            <motion.form className="nx-glass nx-panel nx-settings__panel" onSubmit={savePreferences} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="nx-panel__head"><div><h2>Voice</h2><p className="nx-muted">Browser speech synthesis and microphone behaviour.</p></div></div>
              <Toggle icon={Volume2} label="Speak replies aloud" description="Use your browser's built-in text-to-speech voice." checked={prefs.voiceEnabled} onChange={(value) => setPrefs({ ...prefs, voiceEnabled: value })} />

              <label className="nx-field">
                <span className="nx-label">Voice</span>
                <select className="nx-select" value={prefs.voiceName || 'default'} onChange={(event) => setPrefs({ ...prefs, voiceName: event.target.value })}>
                  <option value="default">System default</option>
                  {voices.map((voice) => <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)}
                </select>
              </label>

              <label className="nx-field">
                <span className="nx-label">Speaking rate · {Number(prefs.voiceRate || 1).toFixed(2)}×</span>
                <input className="nx-range" type="range" min="0.5" max="2" step="0.05" value={prefs.voiceRate || 1} onChange={(event) => setPrefs({ ...prefs, voiceRate: event.target.value })} />
              </label>

              <label className="nx-field">
                <span className="nx-label">Pitch · {Number(prefs.voicePitch || 1).toFixed(2)}</span>
                <input className="nx-range" type="range" min="0.5" max="2" step="0.05" value={prefs.voicePitch || 1} onChange={(event) => setPrefs({ ...prefs, voicePitch: event.target.value })} />
              </label>

              <p className="nx-muted nx-settings__hint">Live microphone recognition depends on browser support and permission. Typed input works everywhere.</p>
              <button className="nx-btn nx-btn--primary nx-settings__save" disabled={busy === 'preferences'}>
                {busy === 'preferences' ? <Loader2 size={16} className="nx-spin" /> : <Save size={16} />} Save voice settings
              </button>
            </motion.form>
          )}

          {tab === 'security' && (
            <motion.form className="nx-glass nx-panel nx-settings__panel" onSubmit={changePassword} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="nx-panel__head"><div><h2>Security</h2><p className="nx-muted">Keep your workspace private.</p></div></div>
              <div className="nx-settings__security-badge"><ShieldCheck size={18} /><div><strong>Password protection active</strong><small>Passwords are hashed with bcrypt. Sessions use signed tokens.</small></div></div>
              <label className="nx-field"><span className="nx-label">Current password</span><input className="nx-input" type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required /></label>
              <label className="nx-field"><span className="nx-label">New password</span><input className="nx-input" type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required /></label>
              <label className="nx-field"><span className="nx-label">Confirm new password</span><input className="nx-input" type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required /></label>
              <p className="nx-muted nx-settings__hint">At least 8 characters with uppercase, lowercase and a number. Changing your password signs you out.</p>
              <button className="nx-btn nx-btn--primary nx-settings__save" disabled={busy === 'password'}>
                {busy === 'password' ? <Loader2 size={16} className="nx-spin" /> : <KeyRound size={16} />} Change password
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
