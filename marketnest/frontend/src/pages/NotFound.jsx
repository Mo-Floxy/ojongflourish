import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Home, Search, Sparkles, Store } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found · Marketnest";
  }, []);

  return (
    <div className="mn-container pub-404">
      <div className="pub-404-art" aria-hidden="true">
        <div className="pub-404-orbit" />
        <div className="pub-404-orbit pub-404-orbit-inner" />
        <Compass size={88} strokeWidth={1.15} />
        <span className="pub-404-badge"><Search size={18} /></span>
        <span className="pub-404-spark"><Sparkles size={18} /></span>
      </div>
      <span className="pub-404-code">404</span>
      <h1>This path wandered off the map</h1>
      <p>
        The page you&apos;re looking for isn&apos;t here — it may have moved, sold out or never
        existed. No worries, there&apos;s plenty more to discover.
      </p>
      <div className="pub-404-actions">
        <Link className="mn-btn" to="/">
          <Home size={16} /> Back home
        </Link>
        <Link className="mn-btn ghost" to="/marketplace">
          <Store size={16} /> Browse the marketplace <ArrowRight size={15} />
        </Link>
      </div>
      <div className="pub-404-hints">
        <span>Popular places:</span>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/businesses">Independent shops</Link>
        <Link to="/cart">Your basket</Link>
      </div>
    </div>
  );
}
