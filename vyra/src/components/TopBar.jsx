import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  ExternalLink,
  LogOut,
} from "lucide-react";
import { GENRES, NOTIFICATIONS } from "../data/music";
import { searchAudius } from "../services/audius";
import { useSpotifyContext } from "../context/SpotifyContext";
import { SpotifyLogo } from "./SpotifyConnectDialog";
import "../styles/search.css";
import "../styles/spotify.css";

const EMPTY_RESULTS = { tracks: [], artists: [], albums: [], playlists: [] };

const spotifyImage = (item) =>
  item?.images?.[0]?.url ||
  item?.album?.images?.at(-1)?.url ||
  item?.album?.images?.[0]?.url ||
  "";

const spotifyUrl = (item) => item?.external_urls?.spotify || "";

export default function TopBar({
  onMenu,
  onPlayTrack,
  onPlaySpotifyTrack,
  onGenreSelect,
  onOpenSpotify,
}) {
  const navigate = useNavigate();
  const spotify = useSpotifyContext();

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [lossless, setLossless] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const q = query.trim();
  const spotifyReady = spotify.configured && spotify.authenticated;
  const spotifyPlaybackReady = spotifyReady && spotify.playerReady;

  const genreHits = useMemo(
    () => (q ? GENRES.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3) : []),
    [q]
  );

  // Debounce typing so we only hit Audius / Spotify after a 300ms pause.
  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(q), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  // Each new term cancels the previous request so stale results never win.
  useEffect(() => {
    if (!term) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    const audiusRequest = searchAudius(term, { kind: "all", limit: 4, signal: controller.signal })
      .then((value) => ({ value, error: "" }))
      .catch((reason) => ({
        value: EMPTY_RESULTS,
        error: reason instanceof Error ? reason.message : String(reason),
      }));

    const spotifyRequest = spotifyReady
      ? spotify
          .searchCatalog(term, { limit: 4, signal: controller.signal })
          .then((value) => ({ value, error: "" }))
          .catch((reason) => ({
            value: EMPTY_RESULTS,
            error: reason instanceof Error ? reason.message : String(reason),
          }))
      : Promise.resolve({ value: EMPTY_RESULTS, error: "" });

    Promise.all([audiusRequest, spotifyRequest]).then(([audius, spotifyResult]) => {
      if (!active || controller.signal.aborted) return;
      setResults({
        tracks: [...(audius.value?.tracks || []), ...(spotifyResult.value?.tracks || [])],
        artists: [...(audius.value?.artists || []), ...(spotifyResult.value?.artists || [])],
        albums: [...(audius.value?.albums || []), ...(spotifyResult.value?.albums || [])],
        playlists: [...(audius.value?.playlists || []), ...(spotifyResult.value?.playlists || [])],
      });
      const messages = [];
      if (audius.error) messages.push(`Audius: ${audius.error}`);
      if (spotifyResult.error) messages.push(`Spotify: ${spotifyResult.error}`);
      setError(messages.join(" · "));
      setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [term, spotifyReady, spotify.searchCatalog]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
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

  const closeSearch = () => {
    setQuery("");
    setTerm("");
    setSearchOpen(false);
    inputRef.current?.blur();
  };

  const pickTrack = (track) => {
    // Local tracks need an explicit source/src for PlayerContext; Audius
    // results already arrive normalized from searchAudius().
    const normalized =
      track?.source === "audius" ? track : { ...track, source: "local", src: track.src };
    onPlayTrack(normalized);
    closeSearch();
  };

  const pickGenre = (id) => {
    onGenreSelect(id);
    closeSearch();
  };

  const goTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setPanel(null);
    inputRef.current?.blur();
  };

  const togglePanel = (name) => setPanel((p) => (p === name ? null : name));

  const hasResults =
    results.tracks.length +
      results.artists.length +
      results.albums.length +
      results.playlists.length >
    0;

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
              {loading && (
                <div className="search__status">
                  <span className="search__spinner" aria-hidden="true" />
                  Searching Audius{spotifyReady ? " & Spotify" : ""}…
                </div>
              )}
              {error && (
                <p className="search__error" role="alert">
                  {error}
                </p>
              )}
              {!spotifyReady && (
                <div className="search__note search__note--spotify">
                  <SpotifyLogo size={16} />
                  <span>Connect Spotify for official catalogue results.</span>
                  <button type="button" onClick={() => { setSearchOpen(false); onOpenSpotify?.(); }}>
                    Connect
                  </button>
                </div>
              )}

              {results.tracks.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Songs</p>
                  {results.tracks.slice(0, 4).map((track) => {
                    const isAudius = track.source === "audius";
                    const content = (
                      <>
                        <img src={isAudius ? track.cover : spotifyImage(track)} alt="" className="search__art" />
                        <span className="search__meta">
                          <span className="search__title">{isAudius ? track.title : track.name}</span>
                          <span className="search__sub">
                            {isAudius
                              ? `${track.artist}${track.album ? ` · ${track.album}` : ""}`
                              : `${track.artists?.map((a) => a.name).join(", ") || "Unknown artist"} · Spotify`}
                          </span>
                        </span>
                      </>
                    );
                    if (isAudius) {
                      return (
                        <button
                          key={track.id}
                          type="button"
                          className="search__row"
                          onClick={() => pickTrack(track)}
                        >
                          {content}
                          <span className="search__play">
                            <Play size={13} fill="currentColor" />
                          </span>
                        </button>
                      );
                    }
                    const url = spotifyUrl(track);
                    if (spotifyPlaybackReady && onPlaySpotifyTrack) {
                      return (
                        <button
                          key={track.id}
                          type="button"
                          className="search__row"
                          onClick={() => onPlaySpotifyTrack(track)}
                        >
                          {content}
                          <span className="search__play">
                            <Play size={13} fill="currentColor" />
                          </span>
                        </button>
                      );
                    }
                    return (
                      <a
                        key={track.id}
                        href={url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="search__row search__row--external"
                        onClick={url ? undefined : (e) => e.preventDefault()}
                      >
                        {content}
                        <span className="search__badge">Spotify</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {results.artists.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Artists</p>
                  {results.artists.slice(0, 3).map((artist) => {
                    const isAudius = artist.source === "audius";
                    const content = (
                      <>
                        <img
                          src={isAudius ? artist.coverImage : spotifyImage(artist)}
                          alt=""
                          className="search__art"
                        />
                        <span className="search__meta">
                          <span className="search__title">{artist.name}</span>
                          <span className="search__sub">
                            {isAudius ? `${artist.followerCount || 0} followers · Audius` : "Spotify artist"}
                          </span>
                        </span>
                      </>
                    );
                    if (isAudius) {
                      return (
                        <button
                          key={artist.id}
                          type="button"
                          className="search__row"
                          onClick={() => goTo(`/artist/audius/${artist.id}`)}
                        >
                          {content}
                        </button>
                      );
                    }
                    const url = spotifyUrl(artist);
                    return (
                      <a
                        key={artist.id}
                        href={url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="search__row search__row--external"
                        onClick={url ? undefined : (e) => e.preventDefault()}
                      >
                        {content}
                        <span className="search__badge">Spotify</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {results.albums.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Albums</p>
                  {results.albums.slice(0, 3).map((album) => {
                    const isAudius = album.source === "audius";
                    const content = (
                      <>
                        <img src={isAudius ? album.cover : spotifyImage(album)} alt="" className="search__art" />
                        <span className="search__meta">
                          <span className="search__title">{isAudius ? album.title : album.name}</span>
                          <span className="search__sub">
                            {isAudius
                              ? `${album.artist || "Unknown artist"} · Audius`
                              : `${album.artists?.map((a) => a.name).join(", ") || "Unknown artist"} · Spotify`}
                          </span>
                        </span>
                      </>
                    );
                    if (isAudius) {
                      return (
                        <button
                          key={album.id}
                          type="button"
                          className="search__row"
                          onClick={() => goTo(`/album/audius/${album.id}`)}
                        >
                          {content}
                        </button>
                      );
                    }
                    const url = spotifyUrl(album);
                    return (
                      <a
                        key={album.id}
                        href={url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="search__row search__row--external"
                        onClick={url ? undefined : (e) => e.preventDefault()}
                      >
                        {content}
                        <span className="search__badge">Spotify</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {results.playlists.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Playlists</p>
                  {results.playlists.slice(0, 3).map((playlist) => {
                    const isAudius = playlist.source === "audius";
                    const content = (
                      <>
                        <img src={isAudius ? playlist.cover : spotifyImage(playlist)} alt="" className="search__art" />
                        <span className="search__meta">
                          <span className="search__title">{isAudius ? playlist.title : playlist.name}</span>
                          <span className="search__sub">
                            {isAudius
                              ? `${playlist.artist || "VYRA"} · Audius`
                              : `${playlist.owner?.display_name || "Spotify"} · Spotify`}
                          </span>
                        </span>
                      </>
                    );
                    if (isAudius) {
                      return (
                        <button
                          key={playlist.id}
                          type="button"
                          className="search__row"
                          onClick={() => goTo(`/album/audius/${playlist.id}`)}
                        >
                          {content}
                        </button>
                      );
                    }
                    const url = spotifyUrl(playlist);
                    return (
                      <a
                        key={playlist.id}
                        href={url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="search__row search__row--external"
                        onClick={url ? undefined : (e) => e.preventDefault()}
                      >
                        {content}
                        <span className="search__badge">Spotify</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {genreHits.length > 0 && (
                <div className="search__group">
                  <p className="search__group-label">Genres</p>
                  {genreHits.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      className="search__row search__row--genre"
                      onClick={() => pickGenre(genre.id)}
                    >
                      <span className="search__art search__art--genre" style={{ backgroundImage: `url(${genre.image})` }} />
                      <span className="search__meta">
                        <span className="search__title">{genre.name}</span>
                        <span className="search__sub">{genre.count}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!loading && !hasResults && genreHits.length === 0 && (
                <div className="search__empty">No matches for “{query}”. Try an artist or genre.</div>
              )}

              {hasResults && (
                <button type="button" className="search__view-all" onClick={() => goTo(`/search?q=${encodeURIComponent(q)}`)}>
                  View all results <ExternalLink size={13} />
                </button>
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
                  {spotifyReady ? (
                    <div className="profile-pop__spotify">
                      <SpotifyLogo size={17} />
                      <span>
                        <strong>{spotify.user?.display_name || spotify.user?.id || "Spotify"}</strong>
                        <small>{spotify.playerReady ? "Connected · playback ready" : "Connected · links & embeds"}</small>
                      </span>
                      <button type="button" onClick={spotify.logout} aria-label="Disconnect Spotify">
                        <LogOut size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="profile-pop__item"
                      onClick={() => { setPanel(null); onOpenSpotify?.(); }}
                    >
                      <SpotifyLogo size={16} /> Connect Spotify
                    </button>
                  )}
                  <button type="button" className="profile-pop__item" onClick={() => goTo("/library")}>
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
