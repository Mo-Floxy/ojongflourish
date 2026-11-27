import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function NewsletterSignup({ compact = false }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("You're on the list", "We'll send fresh finds once a week.");
    setEmail("");
    setBusy(false);
  }

  return (
    <form className="newsletter" onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input
        id={`newsletter-email-${compact ? "compact" : "full"}`}
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="submit" className="mn-btn gold sm" disabled={busy} aria-label="Subscribe">
        <Send size={15} />
      </button>
    </form>
  );
}
