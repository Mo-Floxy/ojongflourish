import { Leaf, Sparkles, Heart } from "lucide-react";

export default function AuthArt() {
  return (
    <aside className="auth-art">
      <Sparkles size={34} color="var(--gold)" style={{ marginBottom: 24 }} />
      <h2>Good things are made close to home.</h2>
      <p>
        Meet the makers, bakers and dreamers around the corner. Every find has a story — and a
        person behind it.
      </p>
      <div className="auth-quote d-flex gap-2 flex-wrap">
        <span className="pill teal"><Leaf size={13} /> Locally made</span>
        <span className="pill gold"><Heart size={13} /> Thoughtfully chosen</span>
      </div>
    </aside>
  );
}
