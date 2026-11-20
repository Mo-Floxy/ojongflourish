import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Library,
  ListMusic,
  Mic,
  Disc,
  Heart,
  Crown,
  ArrowRight,
  AudioWaveform,
  X,
  Sun,
  Moon,
} from "lucide-react";

const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "library", label: "Your Library", icon: Library },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "artists", label: "Artists", icon: Mic },
  { id: "albums", label: "Albums", icon: Disc },
  { id: "liked", label: "Liked Songs", icon: Heart },
];

export default function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  likedCount,
  onUpgrade,
}) {
  const [themeDark, setThemeDark] = useState(true);

  return (
    <>
      <div className={`sidebar-backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar__top">
          <a className="brand" href="#top" onClick={() => onNavigate("home")}>
            <span className="brand__mark">
              <AudioWaveform size={22} strokeWidth={2.2} />
            </span>
            <span className="brand__name">VYRA</span>
          </a>
          <button className="icon-btn sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="nav" aria-label="Main">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                className={`nav__item ${isActive ? "is-active" : ""}`}
                onClick={() => onNavigate(id)}
              >
                {isActive && (
                  <motion.span
                    className="nav__pill"
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={19} strokeWidth={1.9} className="nav__icon" />
                <span className="nav__label">{label}</span>
                {id === "liked" && <span className="nav__count">{likedCount}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__spacer" />

        <div className="premium">
          <span className="premium__glow" aria-hidden="true" />
          <span className="premium__crown">
            <Crown size={19} />
          </span>
          <h3>Connect Spotify</h3>
          <p className="premium__copy">Play official hits from Rema, Davido, Asake and more.</p>
          <button
            type="button"
            className="btn-vyra btn-vyra--sm premium__cta"
            onClick={onUpgrade}
          >
            Connect Now
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="sidebar__theme-toggle">
          <Sun size={15} className={`theme-icon ${!themeDark ? "is-active" : ""}`} />
          <button
            type="button"
            className={`theme-switch ${themeDark ? "is-dark" : "is-light"}`}
            onClick={() => setThemeDark((d) => !d)}
            aria-label="Toggle dark/neon theme"
          >
            <motion.span
              className="theme-switch__knob"
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <Moon size={14} className={`theme-icon ${themeDark ? "is-active" : ""}`} />
        </div>
      </aside>
    </>
  );
}
