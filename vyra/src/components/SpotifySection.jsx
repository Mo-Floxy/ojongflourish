import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AudioLines,
  ExternalLink,
  Headphones,
  LoaderCircle,
  LogOut,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import SectionHead from "./SectionHead";
import Equalizer from "./Equalizer";
import { formatTime, SPOTIFY_PRESETS } from "../data/music";

export default function SpotifySection({ spotify, onPlayTrack }) {
  const [query, setQuery] = useState(SPOTIFY_PRESETS[0].query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const autoSearched = useRef(false);

  const runSearch = async (value) => {
    if (!value?.trim()) return;
    setLoading(true);
    const tracks = await spotify.search(value);
    setResults(tracks);
    setLoading(false);
  };

  useEffect(() => {
    if (spotify.status !== "connected" || autoSearched.current) return;
    autoSearched.current = true;
    runSearch(SPOTIFY_PRESETS[0].query);
  }, [spotify.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const connected = spotify.status === "connected" && Boolean(spotify.deviceId);

  return (
    <section className="section" id="spotify">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon">
            <Headphones size={19} />
          </span>
        }
        title="Popular Naija"
        subtitle="Official hits from Rema, Davido, Asake, Ayra Starr and more — streamed through Spotify."
      >
        {connected && spotify.user && (
          <div className="spotify-account">
            <span className="spotify-account__dot" />
            <span>{spotify.user.display_name || spotify.user.email || "Spotify"}</span>
            <button type="button" onClick={spotify.logout} aria-label="Disconnect Spotify" title="Disconnect">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </SectionHead>

      {!spotify.configured ? (
        <div className="spotify-card spotify-card--setup">
          <span className="spotify-card__icon"><AudioLines size={22} /></span>
          <div>
            <h3>Connect your Spotify app</h3>
            <p>
              Add a Spotify client ID to enable official playback. Create an app in the Spotify
              Developer Dashboard, add <code>http://localhost:5173/</code> as a redirect URI, then
              copy <code>.env.example</code> to <code>.env.local</code> and set your ID.
            </p>
            <div className="spotify-card__actions">
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="btn-vyra btn-vyra--sm"
              >
                Open Developer Dashboard <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      ) : !connected ? (
        <div className="spotify-card spotify-card--login">
          <span className="spotify-card__icon"><AudioLines size={22} /></span>
          <div>
            <h3>{spotify.status === "connecting" ? "Connecting Spotify…" : "Play the real chart hits"}</h3>
            <p>
              Sign in with a Spotify Premium account. Vyra uses Spotify’s official Web Playback
              SDK, so the music streams from Spotify and is never stored here.
            </p>
            {spotify.error && <p className="spotify-card__error" role="alert">{spotify.error}</p>}
            <div className="spotify-card__actions">
              {spotify.status !== "connecting" && (
                <button type="button" className="btn-vyra btn-vyra--sm" onClick={spotify.login}>
                  <Play size={14} fill="currentColor" /> Connect Spotify
                </button>
              )}
              {spotify.status === "connecting" && <LoaderCircle size={20} className="spin" />}
            </div>
          </div>
        </div>
      ) : (
        <>
          {spotify.error && <p className="spotify-card__error" role="alert">{spotify.error}</p>}

          <div className="spotify-presets" aria-label="Popular Nigerian artists">
            {SPOTIFY_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                type="button"
                className={`spotify-preset ${query === preset.query ? "is-active" : ""}`}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setQuery(preset.query);
                  runSearch(preset.query);
                }}
              >
                <span className="spotify-preset__name">{preset.label}</span>
                <span className="spotify-preset__hint">{preset.hint}</span>
              </motion.button>
            ))}
          </div>

          <form
            className="spotify-search"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(query);
            }}
          >
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search any artist or song on Spotify"
              aria-label="Search Spotify"
            />
            <button type="submit" disabled={loading}>
              {loading ? <LoaderCircle size={16} className="spin" /> : "Search"}
            </button>
          </form>

          <div className="spotify-results">
            {loading && results.length === 0 && (
              <p className="spotify-results__empty"><LoaderCircle size={16} className="spin" /> Searching Spotify…</p>
            )}
            {!loading && results.length === 0 && (
              <p className="spotify-results__empty">No tracks found. Try another artist or song.</p>
            )}
            {results.map((item) => {
              const active = spotify.track?.uri === item.uri;
              const image = item.album?.images?.at(-1)?.url || item.album?.images?.[0]?.url || "";
              return (
                <div key={item.id} className={`spotify-result ${active ? "is-active" : ""}`}>
                  <img src={image} alt="" loading="lazy" />
                  <div className="spotify-result__meta">
                    <p className="spotify-result__title">{item.name}</p>
                    <p className="spotify-result__artist">
                      {item.artists?.map((artist) => artist.name).join(", ")}
                      {item.explicit && <span className="spotify-result__explicit">E</span>}
                    </p>
                  </div>
                  <span className="spotify-result__time">{formatTime((item.duration_ms || 0) / 1000)}</span>
                  <button
                    type="button"
                    className="spotify-result__play"
                    onClick={() => onPlayTrack(item)}
                    aria-label={`Play ${item.name}`}
                    title={`Play ${item.name}`}
                  >
                    {active && spotify.playing ? (
                      <Equalizer bars={4} animated barWidth={2} />
                    ) : (
                      <Play size={15} fill="currentColor" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="spotify-note">
            <Sparkles size={13} /> Playback requires Spotify Premium and an internet connection.
            Search results and audio are provided by Spotify.
          </p>
        </>
      )}
    </section>
  );
}
