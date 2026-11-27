import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Store, User } from "lucide-react";

import AuthArt from "../components/AuthArt";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Sign in · Marketnest";
  }, []);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function demo(role) {
    auth.login(role);
    toast.info(
      role === "vendor" ? "Signed in as a shop owner" : "Signed in as a customer",
      "Explore Marketnest with a demo account."
    );
    navigate(role === "vendor" ? "/vendor" : "/dashboard", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setBusy(false);

    const role = /vendor|shop|temi/i.test(form.email) ? "vendor" : "customer";
    const signedIn = auth.login(role);
    toast.success("Welcome back", `Signed in as ${signedIn.full_name}.`);
    const from = location.state?.from;
    navigate(from || (role === "vendor" ? "/vendor" : "/dashboard"), { replace: true });
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <form className="auth-form pub-auth-form" onSubmit={submit} noValidate>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to Marketnest</h1>
          <p className="pub-auth-subtitle">
            Your saved finds, orders and maker conversations are waiting for you.
          </p>

          <div>
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div className="pub-input-icon">
              <Mail size={16} />
              <input
                id="login-email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div>
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="pub-input-icon">
              <LockKeyhole size={16} />
              <input
                id="login-password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="mn-btn lg wide" disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
          </button>

          <div className="pub-demo-divider"><span>or continue with a demo</span></div>
          <div className="pub-demo-actions">
            <button type="button" className="mn-btn sm ghost" onClick={() => demo("customer")}>
              <User size={15} /> Continue as customer
            </button>
            <button type="button" className="mn-btn sm ghost" onClick={() => demo("vendor")}>
              <Store size={15} /> Continue as vendor
            </button>
          </div>

          <p className="pub-auth-footer">
            New to Marketnest? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
      <AuthArt />
    </div>
  );
}
