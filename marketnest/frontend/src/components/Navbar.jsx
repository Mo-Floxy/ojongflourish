import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Store,
  Sun,
  Moon,
  User,
  X,
} from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/businesses", label: "Shops" },
];

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isVendor } = useAuth();
  const cart = useCart();
  const favourites = useFavourites();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") || "");
  }, [location.search]);

  function search(event) {
    event.preventDefault();
    navigate(`/marketplace${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  }

  const home = isVendor ? "/vendor" : "/dashboard";
  const initialQuery = query;

  return (
    <header className="site-header">
      <div className="mn-container">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="Marketnest home">
            <span className="brand-mark"><Store size={18} /></span>
            Marketnest
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
            ))}
          </nav>

          <form className="nav-search" onSubmit={search} role="search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, services, shops"
              aria-label="Search Marketnest"
            />
          </form>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-icon nav-menu-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <button
              type="button"
              className="nav-icon theme-toggle"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link to={isVendor ? "/vendor/messages" : "/dashboard/messages"} className="nav-icon" aria-label="Messages">
              <MessageCircle size={19} />
            </Link>
            <Link to={isVendor ? "/dashboard/favourites" : "/dashboard/favourites"} className="nav-icon" aria-label="Saved finds">
              <Heart size={19} />
            </Link>
            <Link to="/cart" className="nav-icon" aria-label={`Basket with ${cart.count} items`}>
              <ShoppingBag size={19} />
              {cart.count > 0 && <span className="cart-count">{cart.count}</span>}
            </Link>
            {user ? (
              <div className="user-menu">
                <button
                  type="button"
                  className="nav-icon"
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <Avatar name={user.full_name} size={32} />
                  <ChevronDown size={13} style={{ marginLeft: -4 }} />
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div style={{ padding: "8px 10px 12px" }}>
                      <strong style={{ fontSize: 13 }}>{user.full_name}</strong>
                      <div className="tiny">{user.email}</div>
                    </div>
                    <Link to={home}><LayoutDashboard size={15} /> {isVendor ? "Shop dashboard" : "My dashboard"}</Link>
                    <Link to={isVendor ? "/vendor/shop" : "/dashboard/profile"}><User size={15} /> Profile</Link>
                    <Link to="/dashboard/favourites"><Heart size={15} /> Saved finds</Link>
                    <button type="button" onClick={logout}><LogOut size={15} /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="mn-btn sm">Sign in</Link>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-nav">
            <nav className="nav-links" style={{ flexDirection: "column", alignItems: "flex-start", padding: "12px 0 18px" }}>
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
              ))}
              <Link to={home}>Dashboard</Link>
              <Link to="/cart">Basket ({cart.count})</Link>
              <Link to="/dashboard/favourites">Saved ({favourites.count})</Link>
            </nav>
            <form className="nav-search" onSubmit={search} style={{ maxWidth: "none", margin: "0 0 16px", display: "flex" }}>
              <Search size={17} />
              <input value={initialQuery} onChange={(event) => setQuery(event.target.value)} placeholder="Search Marketnest" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
