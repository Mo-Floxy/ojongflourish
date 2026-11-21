import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LoaderCircle, LogOut, ShieldCheck, X } from "lucide-react";
import { spotifyRedirectUri } from "../lib/spotify";
import "../styles/spotify.css";

export function SpotifyLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="#1ed760" />
      <path
        d="M5.6 9.2c4.6-1.35 10.2-.9 14.1 1.7"
        fill="none"
        stroke="#08120c"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M6.3 12.6c3.8-1.08 8.4-.7 11.6 1.4"
        fill="none"
        stroke="#08120c"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M7 15.7c3.05-.83 6.72-.53 9.3 1.12"
        fill="none"
        stroke="#08120c"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SpotifyConnectDialog({ open, onClose, spotify }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const busy = spotify.status === "connecting";
  const displayName = spotify.user?.display_name || spotify.user?.id || "Spotify listener";
  const avatar = spotify.user?.images?.[0]?.url;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="spotify-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="spotify-dialog-title"
        >
          <button
            type="button"
            className="spotify-dialog__scrim"
            onClick={onClose}
            aria-label="Close Spotify connection panel"
          />
          <motion.div
            className="spotify-dialog__panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="spotify-dialog__glow" aria-hidden="true" />
            <header className="spotify-dialog__head">
              <div className="spotify-dialog__brand">
                <SpotifyLogo />
                <div>
                  <p className="spotify-dialog__eyebrow">Optional connection</p>
                  <h2 id="spotify-dialog-title">Spotify in VYRA</h2>
                </div>
              </div>
              <button
                type="button"
                className="spotify-dialog__close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            {!spotify.configured ? (
              <div className="spotify-dialog__body">
                <p className="spotify-dialog__copy">
                  Add a Spotify client ID to enable official search and embeds. VYRA keeps working with
                  Audius and the local catalogue without it.
                </p>
                <div className="spotify-dialog__code">
                  <code>{spotifyRedirectUri() || "http://127.0.0.1:5173/"}</code>
                </div>
                <p className="spotify-dialog__hint">
                  Register that exact URI in the Spotify Developer Dashboard, then set{" "}
                  <code>VITE_SPOTIFY_CLIENT_ID</code> and <code>VITE_SPOTIFY_REDIRECT_URI</code> in{" "}
                  <code>vyra/.env.local</code>.
                </p>
                <div className="spotify-dialog__actions">
                  <a
                    className="btn-vyra btn-vyra--sm"
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Dashboard <ExternalLink size={14} />
                  </a>
                  <button type="button" className="spotify-dialog__ghost" onClick={onClose}>
                    Continue as Guest
                  </button>
                </div>
              </div>
            ) : spotify.authenticated ? (
              <div className="spotify-dialog__body">
                <div className="spotify-dialog__account">
                  {avatar ? (
                    <img src={avatar} alt="" className="spotify-dialog__avatar" />
                  ) : (
                    <span className="spotify-dialog__avatar spotify-dialog__avatar--fallback">
                      <SpotifyLogo size={20} />
                    </span>
                  )}
                  <div>
                    <p className="spotify-dialog__account-name">{displayName}</p>
                    <p className="spotify-dialog__status">
                      <span className="spotify-account__dot" />
                      Connected to Spotify
                    </p>
                  </div>
                </div>
                <p className="spotify-dialog__hint">
                  {spotify.playerReady
                    ? "In-app playback is ready. Spotify audio always plays through Spotify’s own player."
                    : "Search, official links, and embeds are ready. Premium in-app playback may take a moment or require account approval."}
                </p>
                <div className="spotify-dialog__actions">
                  <button type="button" className="btn-vyra btn-vyra--sm" onClick={onClose}>
                    Done
                  </button>
                  <button
                    type="button"
                    className="spotify-dialog__ghost spotify-dialog__ghost--danger"
                    onClick={spotify.logout}
                  >
                    <LogOut size={14} /> Disconnect Spotify
                  </button>
                </div>
              </div>
            ) : (
              <div className="spotify-dialog__body">
                <p className="spotify-dialog__copy">
                  Sign in with Spotify to search the official catalogue and play through Spotify’s own
                  player. VYRA never sees your password.
                </p>
                <ul className="spotify-dialog__list">
                  <li>
                    <ShieldCheck size={16} /> Secure Spotify login with PKCE — no client secret in the browser.
                  </li>
                  <li>Real tracks, artists, albums, playlists, artwork, and official links.</li>
                  <li>Audius playback stays separate and keeps working as usual.</li>
                </ul>
                {spotify.error && (
                  <p className="spotify-dialog__error" role="alert">
                    {spotify.error}
                  </p>
                )}
                <div className="spotify-dialog__actions">
                  <button
                    type="button"
                    className="btn-vyra btn-vyra--sm"
                    onClick={spotify.login}
                    disabled={busy}
                  >
                    {busy ? <LoaderCircle size={15} className="spin" /> : <SpotifyLogo size={18} />}
                    {busy ? "Connecting…" : "Connect Spotify"}
                  </button>
                  <button type="button" className="spotify-dialog__ghost" onClick={onClose}>
                    Continue as Guest
                  </button>
                </div>
                <p className="spotify-dialog__fine">
                  Spotify Premium is required for in-app playback. Embeds and official links work for
                  eligible accounts and content.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
