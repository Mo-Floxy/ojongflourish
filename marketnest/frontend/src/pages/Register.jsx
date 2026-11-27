import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, MapPin, Phone, Store, User } from "lucide-react";

import AuthArt from "../components/AuthArt";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const blank = {
  name: "",
  email: "",
  phone: "",
  city: "",
  password: "",
  shop_name: "",
  shop_city: "",
};

export default function Register() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Create an account · Marketnest";
  }, []);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function chooseRole(next) {
    setRole(next);
    setErrors({});
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    if (!form.city.trim()) next.city = "Enter your city.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (role === "vendor" && !form.shop_name.trim()) next.shop_name = "Enter your shop name.";
    if (role === "vendor" && !form.shop_city.trim()) next.shop_city = "Enter your shop's city.";

    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Check the form", "A few details still need attention.");
      return;
    }

    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setBusy(false);

    const signedIn = auth.login(role === "vendor" ? "vendor" : "customer");
    toast.success(
      role === "vendor" ? "Your shop is ready" : "Welcome to Marketnest",
      `Signed in as ${signedIn.full_name}.`
    );
    navigate(role === "vendor" ? "/vendor" : "/dashboard", { replace: true });
  }

  const fields = [
    { key: "name", label: "Full name", placeholder: "Amara Okafor", icon: User },
    { key: "email", label: "Email address", placeholder: "you@example.com", icon: Mail, type: "email" },
    { key: "phone", label: "Phone number", placeholder: "+234 801 234 5678", icon: Phone },
    { key: "city", label: "Your city", placeholder: "Lagos", icon: MapPin },
  ];

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <form className="auth-form pub-auth-form" onSubmit={submit} noValidate>
          <span className="eyebrow">Join the neighbourhood</span>
          <h1>Create your account</h1>
          <p className="pub-auth-subtitle">
            Shop locally, save your favourites and talk directly to the people who make things.
          </p>

          <div className="pub-role-toggle" role="group" aria-label="Account type">
            <button
              type="button"
              className={role === "customer" ? "active" : ""}
              aria-pressed={role === "customer"}
              onClick={() => chooseRole("customer")}
            >
              <User size={16} /> Shopper
            </button>
            <button
              type="button"
              className={role === "vendor" ? "active" : ""}
              aria-pressed={role === "vendor"}
              onClick={() => chooseRole("vendor")}
            >
              <Store size={16} /> Shop owner
            </button>
          </div>

          <div className="pub-form-grid">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="form-label" htmlFor={`register-${field.key}`}>{field.label}</label>
                  <div className="pub-input-icon">
                    <Icon size={16} />
                    <input
                      id={`register-${field.key}`}
                      className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    />
                  </div>
                  {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
                </div>
              );
            })}

            <div className="pub-form-span">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="pub-input-icon">
                <LockKeyhole size={16} />
                <input
                  id="register-password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {role === "vendor" && (
              <>
                <div>
                  <label className="form-label" htmlFor="register-shop-name">Shop name</label>
                  <div className="pub-input-icon">
                    <Store size={16} />
                    <input
                      id="register-shop-name"
                      className={`form-control ${errors.shop_name ? "is-invalid" : ""}`}
                      placeholder="Ember & Oak"
                      value={form.shop_name}
                      onChange={(event) => updateField("shop_name", event.target.value)}
                    />
                  </div>
                  {errors.shop_name && <span className="field-error">{errors.shop_name}</span>}
                </div>
                <div>
                  <label className="form-label" htmlFor="register-shop-city">Shop city</label>
                  <div className="pub-input-icon">
                    <MapPin size={16} />
                    <input
                      id="register-shop-city"
                      className={`form-control ${errors.shop_city ? "is-invalid" : ""}`}
                      placeholder="Lagos"
                      value={form.shop_city}
                      onChange={(event) => updateField("shop_city", event.target.value)}
                    />
                  </div>
                  {errors.shop_city && <span className="field-error">{errors.shop_city}</span>}
                </div>
              </>
            )}
          </div>

          <button type="submit" className="mn-btn lg wide" disabled={busy}>
            {busy ? (
              <><span className="spinner" /> Creating account…</>
            ) : (
              <>Create account <ArrowRight size={16} /></>
            )}
          </button>

          <p className="pub-auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
      <AuthArt />
    </div>
  );
}
