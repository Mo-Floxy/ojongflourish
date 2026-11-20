import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  X,
  Play,
  Headphones,
  Check,
  Crown,
} from "lucide-react";
import { TRACKS, GENRES, NOTIFICATIONS, formatTime } from "../data/music";

export default function TopBar({ onMenu, onPlayTrack, onGenreSelect }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [lossless, setLossless] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const q = query.trim().toLowerCase();
  const trackHits = useMemo(
    () =>
      q
        ? TRACKS.filter((t) => `${t.title} ${t.artist} ${t.genre}`.toLowerCase().includes(q)).slice(0, 4)
        : [],
    [q]
  );
  const genreHits = useMemo(
    () => (q ? GENRES.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 3) : []),
    [q]
  );

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setPanel(null);
        inputRef.current?.blur();
      }
    };
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const pickTrack = (id) => {
    onPlayTrack(id);
    setQuery("");
    setSearchOpen(false);
    inputRef.current?.blur();
  };

  const pickGenre = (id) => {
    onGenreSelect(id);
    setQuery("");
    setSearchOpen(false);
    inputRef.current?.blur();
  };

  const togglePanel = (name) => setPanel((p) => (p === name ? null : name));

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar__brand" aria-hidden="true">
        VYRA
      </div>

      <div className="search" ref={wrapRef}>
        <Search size={18} className="search__icon" />
        <input
          id="vyra-search"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search songs, artists, albums…"
          aria-label="Search"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            className="search__clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : (
          <span className="search__keys" aria-hidden="true">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        )}

        <AnimatePresence>
          {searchOpen && q && (
            <motion.div
              className="search__panel"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {trackHits.length === 0 && genreHits.length === 0 && (
                <div className="search__empty">
                  No matches for “{query}”. Try an artist or genre.
                </div>
              )}
              {trackHits.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Tracks</p>
                  {trackHits.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="search__row"
                      onClick={() => pickTrack(t.id)}
                    >
                      <img src={t.cover} alt="" className="search__art" />
                      <span className="search__meta">
                        <span className="search__title">{t.title}</span>
                        <span className="search__sub">
                          {t.artist} · {formatTime(t.duration)}
                        </span>
                      </span>
                      <span className="search__play">
                        <Play size={13} fill="currentColor" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {genreHits.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Genres</p>
                  {genreHits.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className="search__row search__row--genre"
                      onClick={() => pickGenre(g.id)}
                    >
                      <span className="search__art search__art--genre" style={{ backgroundImage: `url(${g.image})` }} />
                      <span className="search__meta">
                        <span className="search__title">{g.name}</span>
                        <span className="search__sub">{g.count}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="topbar__actions">
        <div className="topbar__pop-wrap">
          <button
            type="button"
            className={`icon-btn ${panel === "notifications" ? "is-on" : ""}`}
            onClick={() => togglePanel("notifications")}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="badge-dot">3</span>
          </button>
          <AnimatePresence>
            {panel === "notifications" && (
              <>
                <div className="popover-scrim" onClick={() => setPanel(null)} />
                <motion.div
                  className="popover popover--wide"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="popover__head">
                    <h4>Notifications</h4>
                    <span className="popover__badge">3 new</span>
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <button key={n.id} type="button" className="notif" onClick={() => setPanel(null)}>
                      <img src={n.cover} alt="" />
                      <span className="notif__body">
                        <span className="notif__title">{n.title}</span>
                        <span className="notif__text">{n.body}</span>
                      </span>
                      <span className="notif__time">{n.time}</span>
                    </button>
                  ))}
                  <button type="button" className="popover__foot" onClick={() => setPanel(null)}>
                    Mark all as read
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="topbar__pop-wrap">
          <button
            type="button"
            className={`icon-btn ${panel === "settings" ? "is-on" : ""}`}
            onClick={() => togglePanel("settings")}
            aria-label="Listening settings"
          >
            <Settings size={19} />
          </button>
          <AnimatePresence>
            {panel === "settings" && (
              <>
                <div className="popover-scrim" onClick={() => setPanel(null)} />
                <motion.div
                  className="popover"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="popover__head">
                    <h4>Listening</h4>
                  </div>
                  <button type="button" className="toggle-row" onClick={() => setLossless((v) => !v)}>
                    <span className="toggle-row__icon">
                      <Headphones size={16} />
                    </span>
                    <span className="toggle-row__body">
                      <span className="toggle-row__title">Lossless audio</span>
                      <span className="toggle-row__sub">Studio quality, up to 24-bit</span>
                    </span>
                    <span className={`switch ${lossless ? "is-on" : ""}`} aria-hidden="true">
                      <span />
                    </span>
                  </button>
                  <button type="button" className="toggle-row" onClick={() => setAutoplay((v) => !v)}>
                    <span className="toggle-row__icon">
                      <Play size={16} />
                    </span>
                    <span className="toggle-row__body">
                      <span className="toggle-row__title">Autoplay</span>
                      <span className="toggle-row__sub">Keep the vibe going</span>
                    </span>
                    <span className={`switch ${autoplay ? "is-on" : ""}`} aria-hidden="true">
                      <span />
                    </span>
                  </button>
                  <p className="popover__hint">Preferences are saved on this device.</p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="topbar__pop-wrap">
          <button
            type="button"
            className={`profile ${panel === "profile" ? "is-on" : ""}`}
            onClick={() => togglePanel("profile")}
            aria-label="Account menu"
          >
            <img src="/images/hero-v2.jpg" alt="Flourish" className="profile__avatar" />
            <span className="profile__meta">
              <span className="profile__name">Flourish</span>
              <span className="profile__plan">Free plan</span>
            </span>
            <ChevronDown size={15} className="profile__chev" />
          </button>
          <AnimatePresence>
            {panel === "profile" && (
              <>
                <div className="popover-scrim" onClick={() => setPanel(null)} />
                <motion.div
                  className="popover popover--profile"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="profile-pop__head">
                    <img src="/images/hero-v2.jpg" alt="" className="profile-pop__avatar" />
                    <div>
                      <p className="profile-pop__name">Flourish</p>
                      <p className="profile-pop__plan">Free plan · 14-day streak</p>
                    </div>
                  </div>
                  <button type="button" className="profile-pop__item" onClick={() => setPanel(null)}>
                    <Check size={15} /> Your Library
                  </button>
                  <button type="button" className="profile-pop__item" onClick={() => setPanel(null)}>
                    <Settings size={15} /> Account settings
                  </button>
                  <button type="button" className="profile-pop__cta" onClick={() => setPanel(null)}>
                    <Crown size={15} /> Go premium
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
