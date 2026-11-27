import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail, MapPin, Phone, RotateCcw, Save, ShieldCheck, UserRound } from "lucide-react";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { user as seedUser } from "../../data/mock";

const emptyErrors = {};

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const account = user || seedUser;

  const initial = {
    first_name: account.first_name || "",
    last_name: account.last_name || "",
    phone: account.phone || "",
    city: account.city || "",
    bio: account.bio || "",
  };

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    document.title = "My profile · Marketnest";
  }, []);

  const displayName = `${form.first_name} ${form.last_name}`.trim() || "Your name";
  const dirty = Object.keys(form).some((key) => form[key] !== saved[key]);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.first_name.trim()) nextErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Check your details", "Add the missing fields before saving.");
      return;
    }
    setForm((current) => ({
      ...current,
      first_name: current.first_name.trim(),
      last_name: current.last_name.trim(),
    }));
    setSaved({
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
    });
    toast.success("Profile updated", "Your details have been saved on this device.");
  }

  function reset() {
    setForm(saved);
    setErrors(emptyErrors);
    toast.info("Changes discarded", "Your saved details are back in the form.");
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>My profile</h1>
          <p>Keep your details current so shops can reach you easily.</p>
        </div>
        <div className="dash-actions">
          <Link to="/dashboard/settings" className="mn-btn ghost">Account settings</Link>
        </div>
      </header>

      <div className="dash-profile-grid">
        <form className="form-card dash-profile-form" onSubmit={submit} noValidate>
          <div className="panel-head dash-profile-form-head">
            <div>
              <h2>Personal details</h2>
              <p className="sub">This information is shared with shops you order from.</p>
            </div>
            <span className="pill teal"><ShieldCheck size={12} /> Verified member</span>
          </div>

          <div className="dash-field-grid">
            <div className="dash-field">
              <label className="form-label" htmlFor="profile-first">First name</label>
              <input
                id="profile-first"
                className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                value={form.first_name}
                onChange={update("first_name")}
                autoComplete="given-name"
              />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="dash-field">
              <label className="form-label" htmlFor="profile-last">Last name</label>
              <input
                id="profile-last"
                className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                value={form.last_name}
                onChange={update("last_name")}
                autoComplete="family-name"
              />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
            <div className="dash-field">
              <label className="form-label" htmlFor="profile-email">Email address</label>
              <div className="dash-readonly-field">
                <Mail size={16} />
                <input id="profile-email" className="form-control" value={account.email || ""} readOnly aria-readonly="true" />
              </div>
              <span className="tiny">Your email can&apos;t be changed here.</span>
            </div>
            <div className="dash-field">
              <label className="form-label" htmlFor="profile-phone">Phone number</label>
              <div className="dash-input-with-icon">
                <Phone size={16} />
                <input
                  id="profile-phone"
                  className="form-control"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="e.g. +234 801 234 5678"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="dash-field">
              <label className="form-label" htmlFor="profile-city">City</label>
              <div className="dash-input-with-icon">
                <MapPin size={16} />
                <input
                  id="profile-city"
                  className="form-control"
                  value={form.city}
                  onChange={update("city")}
                  placeholder="Where should deliveries go?"
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="dash-field dash-field-full">
              <label className="form-label" htmlFor="profile-bio">Short bio</label>
              <textarea
                id="profile-bio"
                className="form-control"
                rows="4"
                maxLength={240}
                value={form.bio}
                onChange={update("bio")}
                placeholder="Tell shops a little about yourself…"
              />
              <span className="tiny">{form.bio.length}/240 characters</span>
            </div>
          </div>

          <div className="dash-form-actions">
            <button type="button" className="mn-btn ghost" onClick={reset} disabled={!dirty}>
              <RotateCcw size={15} /> Discard
            </button>
            <button type="submit" className="mn-btn" disabled={!dirty}>
              <Save size={15} /> Save changes
            </button>
          </div>
        </form>

        <aside className="dash-profile-side">
          <div className="panel dash-profile-card text-center">
            <Avatar name={displayName} src={account.avatar} size={96} className="dash-profile-avatar" />
            <h2>{displayName}</h2>
            <p className="text-muted mb-1">{form.city || "Add your city"}</p>
            <span className="pill"><UserRound size={12} /> Marketnest member</span>
            <p className="tiny mt-3 mb-0">{form.bio || "Your bio will appear here once you add one."}</p>
          </div>
          <div className="panel dash-profile-tip">
            <CheckCircle2 size={20} />
            <div>
              <h3>A little tip</h3>
              <p className="tiny mb-0">
                Adding your phone number helps makers confirm custom orders faster.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
