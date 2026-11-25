import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AudioLines,
  ExternalLink,
  LoaderCircle,
  LogOut,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import SectionHead from "./SectionHead";
import Equalizer from "./Equalizer";
import { SpotifyLogo } from "./SpotifyConnectDialog";
import { spotifyRedirectUri } from "../lib/spotify";
import { formatTime, SPOTIFY_PRESETS } from "../data/music";
import "../styles/spotify.css";

export default function SpotifySection({ spotify, onPlayTrack, onOpenSpotify }) {
  const [query, setQuery] = useState(SPOTIFY_PRESETS[0].query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [artistMeta, setArtistMeta] = useState({});
  const autoSearched = useRef(false);

  const authenticated = Boolean(spotify.configured && spotify.authenticated);
  const playbackReady = authenticated && spotify.playerReady;

  const runSearch = async (value) => {
    if (!value?.trim()) return;
    setLoading(true);
    try {
      const tracks = await spotify.search(value);
      setResults(tracks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authenticated || autoSearched.current) return;
    autoSearched.current = true;
    runSearch(SPOTIFY_PRESETS[0].query);
  }, [authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Official artist photos come from Spotify, never from fake Audius uploads.
  useEffect(() => {
    if (!authenticated) return undefined;
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        SPOTIFY_PRESETS.map(async (preset) => {
          try {
            const { artists } = await spotify.searchCatalog(preset.label, {
              types: ["artist"],
              limit: 5,
            });
            const artist =
              artists.find((item) => item.name?.trim().toLowerCase() === preset.label.toLowerCase()) ||
              artists[0];
            return [
              preset.id,
              artist
                ? {
                    name: artist.name,
                    image: artist.images?.[0]?.url || "",
                    url: artist.external_urls?.spotify || "",
                  }
                : null,
            ];
          } catch {
            return [preset.id, null];
          }
        })
      );
      if (!cancelled) setArtistMeta(Object.fromEntries(entries.filter(Boolean)));
    })();

    return () => {
      cancelled = true;
    };
  }, [authenticated, spotify.searchCatalog]);

  const headActions = authenticated ? (
    spotify.user ? (
      <div className="spotify-account">
        <span className="spotify-account__dot" aria-hidden="true" />
        <span>{spotify.user.display_name || spotify.user.email || spotify.user.id || "Spotify"}</span>
        <button type="button" onClick={spotify.logout} aria-label="Disconnect Spotify" title="Disconnect">
          <LogOut size={14} />
        </button>
      </div>
    ) : null
  ) : (
    <button type="button" className="spotify-section-connect" onClick={onOpenSpotify}>
      <SpotifyLogo size={16} /> Connect Spotify
    </button>
  );

  return (
    <section className="section" id="spotify">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon">
            <AudioLines size={19} />
          </span>
        }
        title="Popular Naija"
        subtitle="Burna Boy, Davido, Wizkid, Mavo and more — official artist photos and hits through Spotify."
      >
        {headActions}
      </SectionHead>

      {!spotify.configured ? (
        <div className="spotify-card spotify-card--setup">
          <span className="spotify-card__icon"><AudioLines size={22} /></span>
          <div>
            <h3>Spotify is optional</h3>
            <p>
              Add a Spotify client ID to enable official search and embeds. Register{" "}
              <code>{spotifyRedirectUri() || "http://127.0.0.1:5173/"}</code> in the Spotify
              Developer Dashboard, plus the production URI{" "}
              <code>https://vyra-azure-iota.vercel.app/</code>, then set the values in{" "}
              <code>.env.local</code>.
            </p>
            <div className="spotify-card__actions">
              <button type="button" className="btn-vyra btn-vyra--sm" onClick={onOpenSpotify}>
                <SpotifyLogo size={16} /> Continue as Guest
              </button>
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                Developer Dashboard <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      ) : !authenticated ? (
        guestMode ? (
          <div className="spotify-card spotify-card--guest">
            <SpotifyLogo size={20} />
            <span>You’re browsing as a guest. Audius and local playback still work.</span>
            <button type="button" onClick={() => setGuestMode(false)}>Show Spotify options</button>
            <button type="button" className="is-quiet" onClick={onOpenSpotify}>Connect</button>
          </div>
        ) : (
          <div className="spotify-card spotify-card--login">
            <span className="spotify-card__icon"><SpotifyLogo size={22} /></span>
            <div>
              <h3>Discover the real chart hits</h3>
              <p>
                Connect with Spotify’s secure PKCE login to search real tracks, artists, albums and
                playlists. VYRA never sees your password and never downloads Spotify audio.
              </p>
              {spotify.error && <p className="spotify-card__error" role="alert">{spotify.error}</p>}
              <div className="spotify-card__actions">
                <button type="button" className="btn-vyra btn-vyra--sm" onClick={onOpenSpotify}>
                  <Play size={14} fill="currentColor" /> Connect Spotify
                </button>
                <button type="button" className="btn-ghost" onClick={() => setGuestMode(true)}>
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        )
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
                {artistMeta[preset.id]?.image ? (
                  <img
                    className="spotify-preset__img"
                    src={artistMeta[preset.id].image}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="spotify-preset__avatar" aria-hidden="true">
                    {preset.label.charAt(0)}
                  </span>
                )}
                <span className="spotify-preset__copy">
                  <span className="spotify-preset__name">{preset.label}</span>
                  <span className="spotify-preset__hint">{preset.hint}</span>
                </span>
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
              const officialUrl = item.external_urls?.spotify || "";
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
                  {playbackReady ? (
                    <button
                      type="button"
                      className="spotify-result__play"
                      onClick={() => onPlayTrack(item)}
                      aria-label={`Play ${item.name} on Spotify`}
                      title={`Play ${item.name} on Spotify`}
                    >
                      {active && spotify.playing ? (
                        <Equalizer bars={4} animated barWidth={2} />
                      ) : (
                        <Play size={15} fill="currentColor" />
                      )}
                    </button>
                  ) : officialUrl ? (
                    <a
                      className="spotify-result__play"
                      href={officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${item.name} in Spotify`}
                      title="Open in Spotify"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="spotify-note">
            <Sparkles size={13} /> Search, artwork and official links work after connecting.
            In-app playback needs Spotify Premium and app/account approval; embeds and open-in-Spotify
            stay available otherwise.
          </p>
        </>
      )}
    </section>
  );
}
