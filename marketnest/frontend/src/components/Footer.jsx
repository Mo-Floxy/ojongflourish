import { Link } from "react-router-dom";
import { Instagram, Leaf, Mail, MapPin, Phone } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mn-container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              <span className="brand-mark"><Leaf size={18} /></span>
              Marketnest
            </Link>
            <p style={{ marginTop: 14 }}>
              A home for independent makers and the people who love what they make. Discover
              nearby shops, shop with intention, and keep a little more of your money local.
            </p>
            <NewsletterSignup compact />
          </div>
          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/businesses">All shops</Link>
              <Link to="/marketplace?category=1">Home & living</Link>
              <Link to="/marketplace?category=3">Jewellery</Link>
              <Link to="/marketplace?featured=1">Editor's picks</Link>
            </div>
          </div>
          <div>
            <h4>Your account</h4>
            <div className="footer-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/dashboard/orders">Orders</Link>
              <Link to="/dashboard/favourites">Saved finds</Link>
              <Link to="/vendor">Sell on Marketnest</Link>
            </div>
          </div>
          <div>
            <h4>Say hello</h4>
            <div className="footer-links">
              <span><MapPin size={14} style={{ verticalAlign: -2 }} /> Lagos, Nigeria</span>
              <span><Mail size={14} style={{ verticalAlign: -2 }} /> hello@marketnest.example</span>
              <span><Phone size={14} style={{ verticalAlign: -2 }} /> +234 800 123 4567</span>
              <span><Instagram size={14} style={{ verticalAlign: -2 }} /> @marketnest</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Marketnest. Made with care.</span>
          <span>Local first · Thoughtfully made · People over parcels</span>
        </div>
      </div>
    </footer>
  );
}
