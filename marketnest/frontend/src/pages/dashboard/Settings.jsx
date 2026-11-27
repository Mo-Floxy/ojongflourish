import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellRing,
  CreditCard,
  Globe2,
  LogOut,
  Mail,
  Moon,
  Palette,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  Volume2,
} from "lucide-react";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { user as seedUser } from "../../data/mock";

const tabs = [
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "appearance", label: "Appearance & locale", icon: Palette },
  { id: "account", label: "Account & security", icon: ShieldAlert },
];

const initialPreferences = {
  orderUpdates: true,
  messages: true,
  promotions: false,
  sound: true,
  currency: "NGN",
};

const initialDisplay = {
  theme: "light",
  locale: "en-NG",
  density: "comfortable",
  timezone: "Africa/Lagos",
};

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <div className="dash-setting-row">
      <div>
        <label className="form-check-label" htmlFor={id}><strong>{label}</strong></label>
        <p className="tiny mb-0">{hint}</p>
      </div>
      <div className="form-check">
        <input
          id={id}
          type="checkbox"
          className="form-check-input dash-switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("notifications");
  const [preferences, setPreferences] = useState(initialPreferences);
  const [display, setDisplay] = useState(() => ({ ...initialDisplay, theme }));
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    document.title = "Settings · Marketnest";
  }, []);

  useEffect(() => {
    setDisplay((current) => (current.theme === theme ? current : { ...current, theme }));
  }, [theme]);

  const account = user || seedUser;
  const themeLabel = display.theme === "system" ? `system (${resolvedTheme})` : display.theme;

  function updatePreference(key) {
    return (value) => setPreferences((current) => ({ ...current, [key]: value }));
  }

  function updateDisplay(event) {
    const { name, value } = event.target;
    if (name === "theme") setTheme(value);
    setDisplay((current) => ({ ...current, [name]: value }));
  }

  function saveSection(label) {
    toast.success(`${label} saved`, "Your choices have been applied for this session.");
  }

  function signOut() {
    logout();
    setSignOutOpen(false);
    toast.info("Signed out", "You can sign back in any time.");
    navigate("/login");
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Make it yours</span>
          <h1>Settings</h1>
          <p>Choose how Marketnest looks, sounds and keeps you informed.</p>
        </div>
      </header>

      <div className="dash-settings-layout">
        <nav className="dash-settings-tabs" aria-label="Settings sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`dash-settings-tab ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "true" : undefined}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="dash-settings-content">
          {activeTab === "notifications" && (
            <>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Email notifications</h2>
                    <p className="sub">Decide what lands in your inbox.</p>
                  </div>
                  <Mail size={19} className="text-muted" />
                </div>
                <Toggle
                  id="pref-orders"
                  checked={preferences.orderUpdates}
                  onChange={updatePreference("orderUpdates")}
                  label="Order updates"
                  hint="Confirmations, dispatch notices and delivery updates."
                />
                <Toggle
                  id="pref-messages"
                  checked={preferences.messages}
                  onChange={updatePreference("messages")}
                  label="New messages"
                  hint="Get an email when a shop replies to you."
                />
                <Toggle
                  id="pref-promotions"
                  checked={preferences.promotions}
                  onChange={updatePreference("promotions")}
                  label="Offers and new arrivals"
                  hint="Occasional news from shops you follow."
                />
                <div className="dash-form-actions">
                  <button type="button" className="mn-btn sm" onClick={() => saveSection("Notification preferences")}>
                    Save preferences
                  </button>
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Alerts &amp; display</h2>
                    <p className="sub">Small details that shape your browsing.</p>
                  </div>
                  <Volume2 size={19} className="text-muted" />
                </div>
                <Toggle
                  id="pref-sound"
                  checked={preferences.sound}
                  onChange={updatePreference("sound")}
                  label="Sound alerts"
                  hint="Play a soft sound when a new message arrives."
                />
                <div className="dash-field dash-setting-field">
                  <label className="form-label" htmlFor="pref-currency">Currency display</label>
                  <div className="dash-input-with-icon">
                    <CreditCard size={16} />
                    <select
                      id="pref-currency"
                      className="form-select"
                      value={preferences.currency}
                      onChange={(event) => updatePreference("currency")(event.target.value)}
                    >
                      <option value="NGN">NGN — Nigerian Naira (₦)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                    </select>
                  </div>
                  <span className="tiny">Prices are stored in naira; this only changes how they&apos;re shown.</span>
                </div>
              </section>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Appearance</h2>
                    <p className="sub">Set the look and feel of your dashboard.</p>
                  </div>
                  <Moon size={19} className="text-muted" />
                </div>
                <div className="dash-field-grid">
                  <div className="dash-field">
                    <label className="form-label" htmlFor="display-theme">Theme</label>
                    <select id="display-theme" name="theme" className="form-select" value={display.theme} onChange={updateDisplay}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">Match my device</option>
                    </select>
                    <span className="tiny">Applies everywhere instantly and is saved on this device.</span>
                  </div>
                  <div className="dash-field">
                    <label className="form-label" htmlFor="display-density">Density</label>
                    <select id="display-density" name="density" className="form-select" value={display.density} onChange={updateDisplay}>
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                  <div className="dash-field">
                    <label className="form-label" htmlFor="display-locale">Language &amp; region</label>
                    <div className="dash-input-with-icon">
                      <Globe2 size={16} />
                      <select id="display-locale" name="locale" className="form-select" value={display.locale} onChange={updateDisplay}>
                        <option value="en-NG">English (Nigeria)</option>
                        <option value="en-US">English (United States)</option>
                        <option value="en-GB">English (United Kingdom)</option>
                        <option value="fr-FR">Français</option>
                      </select>
                    </div>
                  </div>
                  <div className="dash-field">
                    <label className="form-label" htmlFor="display-timezone">Timezone</label>
                    <select id="display-timezone" name="timezone" className="form-select" value={display.timezone} onChange={updateDisplay}>
                      <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">London</option>
                      <option value="America/New_York">New York</option>
                    </select>
                  </div>
                </div>
                <div className="dash-form-actions">
                  <button type="button" className="mn-btn sm" onClick={() => saveSection("Appearance settings")}>
                    Save appearance
                  </button>
                </div>
              </section>

              <div className="dash-settings-preview">
                <span className="eyebrow">Preview</span>
                <div className="panel dash-preview-card">
                  <div className="d-flex align-items-center gap-2">
                    <span className="dash-preview-badge"><ShoppingBag size={15} /></span>
                    <strong>Order MN-24068 is on its way</strong>
                  </div>
                  <p className="tiny mb-0">
                    Shown in {display.locale} · {themeLabel} theme · {display.density} spacing.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Account details</h2>
                    <p className="sub">The identity linked to your orders.</p>
                  </div>
                  <ShieldAlert size={19} className="text-muted" />
                </div>
                <div className="dash-account-row">
                  <span>Name</span><strong>{account.full_name || `${account.first_name} ${account.last_name}`}</strong>
                </div>
                <div className="dash-account-row">
                  <span>Email</span><strong>{account.email}</strong>
                </div>
                <div className="dash-account-row">
                  <span>Role</span><strong>{account.role === "vendor" ? "Vendor" : "Customer"}</strong>
                </div>
              </section>

              <section className="panel dash-danger-zone">
                <div className="panel-head">
                  <div>
                    <h2>Danger zone</h2>
                    <p className="sub">Actions here affect your account access.</p>
                  </div>
                  <ShieldAlert size={19} />
                </div>
                <div className="dash-danger-row">
                  <div>
                    <strong>Sign out of this device</strong>
                    <p className="tiny mb-0">You&apos;ll need to log in again to use your dashboard.</p>
                  </div>
                  <button type="button" className="mn-btn ghost" onClick={() => setSignOutOpen(true)}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
                <div className="dash-danger-row">
                  <div>
                    <strong>Delete account</strong>
                    <p className="tiny mb-0">This is a demo — no account data is actually removed.</p>
                  </div>
                  <button type="button" className="mn-btn ghost dash-danger-outline" onClick={() => setDeleteOpen(true)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Modal open={signOutOpen} onClose={() => setSignOutOpen(false)} title="Sign out of Marketnest?">
        <p>You&apos;ll be taken to the login screen. Any unsaved form changes won&apos;t be kept.</p>
        <div className="dash-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setSignOutOpen(false)}>Stay signed in</button>
          <button type="button" className="mn-btn clay" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <p>
          This demo doesn&apos;t connect to a backend, so nothing will be deleted. In a live app this
          would permanently remove your profile and order history.
        </p>
        <div className="dash-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setDeleteOpen(false)}>Keep my account</button>
          <button
            type="button"
            className="mn-btn clay"
            onClick={() => {
              setDeleteOpen(false);
              toast.info("Demo only", "No account data was removed.");
            }}
          >
            <Trash2 size={15} /> Delete anyway
          </button>
        </div>
      </Modal>
    </>
  );
}
