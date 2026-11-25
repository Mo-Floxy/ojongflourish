import { useCallback, useEffect, useState } from "react";
import { AudioLines, ExternalLink, Play, RefreshCw } from "lucide-react";
import SectionHead from "./SectionHead";
import Equalizer from "./Equalizer";
import AudiusImage from "./AudiusImage";
import {
  getLatestTracks,
  getPopularArtists,
  getTrendingCollections,
  getTrendingTracks,
  isAudiusConfigured,
  isMusician,
  isMusicianTrack,
} from "../services/audius";
import { getTrendingAfrobeats } from "../services/popular";
import "../styles/discovery.css";

const formatDuration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
};

const formatCount = (value) => {
  const count = Math.max(0, Number(value) || 0);
  if (!count) return "";
  if (count < 1000) return String(count);
  const rounded = (count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, "");
  return `${rounded}k`;
};

const errorMessage = (error) =>
  (typeof error?.message === "string" && error.message) ||
  "Audius could not be reached. Please try again.";

function useAudiusResource(loader, fallbackMessage) {
  const [state, setState] = useState({ loading: true, items: [], meta: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAudiusConfigured()) return undefined;

    const controller = new AbortController();
    let active = true;
    setState({ loading: true, items: [], meta: null, error: "" });

    Promise.resolve()
      .then(() => loader({ signal: controller.signal }))
      .then((result) => {
        if (!active || controller.signal.aborted) return;
        const payload = Array.isArray(result) ? { items: result } : result || {};
        setState({
          loading: false,
          items: Array.isArray(payload.items) ? payload.items : [],
          meta: payload.meta || null,
          error: "",
        });
      })
      .catch((error) => {
        if (!active || controller.signal.aborted || error?.name === "AbortError") return;
        setState({
          loading: false,
          items: [],
          meta: null,
          error: errorMessage(error) || fallbackMessage,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [loader, attempt, fallbackMessage]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}

function RefreshButton({ feed, label }) {
  return (
    <button
      type="button"
      className="icon-btn icon-btn--sm audius-refresh"
      onClick={feed.retry}
      aria-label={`Refresh ${label}`}
      title={`Refresh ${label}`}
    >
      <RefreshCw size={14} />
    </button>
  );
}

function TrackSkeletons({ count = 5 }) {
  return (
    <div className="audius-skeleton-row" role="status" aria-label="Loading Audius tracks">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="audius-skeleton audius-skeleton--row" aria-hidden="true" />
      ))}
    </div>
  );
}

function CardSkeletons({ count = 6 }) {
  return (
    <div className="audius-skeleton-grid" role="status" aria-label="Loading Audius cards">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="audius-skeleton audius-skeleton--card" aria-hidden="true" />
      ))}
    </div>
  );
}

function FeedError({ message, onRetry }) {
  return (
    <div className="audius-state audius-state--error" role="alert">
      <p>{message}</p>
      <button type="button" className="btn-vyra btn-vyra--sm" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

function FeedEmpty({ message }) {
  return (
    <div className="audius-state">
      <p>{message}</p>
    </div>
  );
}

function AudiusTrackList({ tracks, currentId, playing, onPlayTrack, onPlayTracks }) {
  return (
    <div className="audius-track-list">
      {tracks.map((track, index) => {
        const active = String(currentId || "") === String(track.id || "");

        const playOne = () => {
          if (typeof onPlayTrack === "function") onPlayTrack(track);
          else if (typeof onPlayTracks === "function") onPlayTracks(tracks, index);
        };
        const playQueue = () => {
          if (typeof onPlayTracks === "function") onPlayTracks(tracks, index);
          else if (typeof onPlayTrack === "function") onPlayTrack(track);
        };

        return (
          <div key={`${track.id || track.permalink || "track"}-${index}`} className={`audius-track ${active ? "is-active" : ""}`}>
            <button
              type="button"
              className="audius-track__art"
              onClick={playOne}
              aria-label={`${active && playing ? "Playing" : "Play"} ${track.title}`}
              title={track.title}
            >
              <AudiusImage artwork={track.artwork} alt={`${track.title} artwork`} size="240x240" />
            </button>

            <div className="audius-track__meta">
              <div className="audius-track__title-row">
                <button type="button" className="audius-track__title-btn" onClick={playOne} title={track.title}>
                  <span className="audius-track__title">{track.title}</span>
                </button>
                {active && (
                  <Equalizer
                    bars={4}
                    animated={Boolean(playing)}
                    barWidth={2}
                    className="audius-track__eq"
                  />
                )}
              </div>
              <span className="audius-track__artist">{track.artist}</span>
            </div>

            <span className="audius-track__time">{formatDuration(track.duration)}</span>

            <button
              type="button"
              className="audius-track__play"
              onClick={playQueue}
              aria-label={`Play ${track.title} with the rest of this Audius list`}
              title="Play from here"
            >
              {active && playing ? (
                <Equalizer bars={4} animated barWidth={2} />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AudiusEntityGrid({ items, variant, onOpen }) {
  const isArtist = variant === "artist";

  return (
    <div className="audius-card-grid">
      {items.map((item, index) => {
        const label = isArtist ? item.name : item.title;
        const sub = isArtist ? (item.handle ? `@${item.handle}` : "Audius artist") : item.artist;
        const followers = formatCount(item.followerCount);
        const meta = isArtist
          ? (followers ? `${followers} followers` : "")
          : [item.isAlbum ? "Album" : "Collection", item.trackCount ? `${item.trackCount} tracks` : ""]
              .filter(Boolean)
              .join(" · ");

        return (
          <button
            type="button"
            key={`${item.id || item.permalink || variant}-${index}`}
            className={`audius-card audius-card--${variant}`}
            onClick={() => onOpen?.(item)}
            aria-label={`Open ${label}`}
          >
            <span className="audius-card__art">
              <AudiusImage artwork={item.artwork} alt={`${label} artwork`} size="480x480" />
              <span className="audius-card__veil" aria-hidden="true" />
              {meta && <span className="audius-card__tag">{meta}</span>}
            </span>
            <span className="audius-card__body">
              <span className="audius-card__title" title={label}>{label}</span>
              <span className="audius-card__sub">{sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AudiusSection({ onPlayTrack, onPlayTracks, currentId, playing, onOpenArtist, onOpenAlbum }) {
  const loadTrending = useCallback(
    async ({ signal }) =>
      (await getTrendingTracks({ time: "week", limit: 50, signal })).filter(isMusicianTrack).slice(0, 8),
    []
  );

  const loadAfrobeats = useCallback(
    ({ signal }) => getTrendingAfrobeats({ limit: 8, signal }),
    []
  );

  const loadLatest = useCallback(
    async ({ signal }) =>
      (await getLatestTracks({ limit: 50, signal })).filter(isMusicianTrack).slice(0, 8),
    []
  );
  const loadArtists = useCallback(
    async ({ signal }) => (await getPopularArtists({ limit: 12, signal })).filter(isMusician).slice(0, 6),
    []
  );
  const loadAlbums = useCallback(
    async ({ signal }) =>
      (await getTrendingCollections({ type: "album", time: "week", limit: 12, signal }))
        .filter(isMusician)
        .slice(0, 6),
    []
  );

  const trending = useAudiusResource(loadTrending, "Trending tracks are unavailable right now.");
  const afrobeats = useAudiusResource(loadAfrobeats, "Afrobeats picks are unavailable right now.");
  const latest = useAudiusResource(loadLatest, "New releases are unavailable right now.");
  const artists = useAudiusResource(loadArtists, "Popular artists are unavailable right now.");
  const albums = useAudiusResource(loadAlbums, "Trending albums are unavailable right now.");

  if (!isAudiusConfigured()) {
    return (
      <div className="audius-discovery">
        <section className="section audius-section" id="audius">
          <SectionHead
            eyebrow={
              <span className="eyebrow-icon eyebrow-icon--blue">
                <AudioLines size={19} />
              </span>
            }
            title="Discover on Audius"
            subtitle="Optional provider-powered discovery from Audius."
          />
          <div className="audius-setup">
            <span className="audius-setup__icon">
              <AudioLines size={24} />
            </span>
            <div className="audius-setup__body">
              <h3>Unlock Audius discovery</h3>
              <p>
                Add an Audius API key to <code>vyra/.env.local</code> as{" "}
                <code>VITE_AUDIUS_API_KEY</code>, then restart the dev server. You can create a key
                in your Audius account settings.
              </p>
              <p className="audius-setup__note">
                Keep the key local: never paste it into chat or commit it to git.
              </p>
              <div className="audius-setup__actions">
                <a
                  className="btn-vyra btn-vyra--sm"
                  href="https://audius.co/settings"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Audius settings <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const tracksFor = (feed, emptyMessage) => {
    if (feed.loading) return <TrackSkeletons />;
    if (feed.error) return <FeedError message={feed.error} onRetry={feed.retry} />;
    if (!feed.items.length) return <FeedEmpty message={emptyMessage} />;
    return (
      <AudiusTrackList
        tracks={feed.items}
        currentId={currentId}
        playing={playing}
        onPlayTrack={onPlayTrack}
        onPlayTracks={onPlayTracks}
      />
    );
  };

  const cardsFor = (feed, variant, onOpen, emptyMessage) => {
    if (feed.loading) return <CardSkeletons />;
    if (feed.error) return <FeedError message={feed.error} onRetry={feed.retry} />;
    if (!feed.items.length) return <FeedEmpty message={emptyMessage} />;
    return <AudiusEntityGrid items={feed.items} variant={variant} onOpen={onOpen} />;
  };

  return (
    <div className="audius-discovery">
      <section className="section audius-section" id="audius-trending">
        <SectionHead
          eyebrow={
            <span className="eyebrow-icon eyebrow-icon--blue">
              <AudioLines size={19} />
            </span>
          }
          title="Trending on Audius"
          subtitle="Real tracks trending on Audius this week."
        >
          <RefreshButton feed={trending} label="Audius trending tracks" />
        </SectionHead>
        {tracksFor(trending, "No trending tracks are available from Audius right now.")}
      </section>

      <section className="section audius-section" id="audius-afrobeats">
        <SectionHead
          eyebrow={
            <span className="eyebrow-icon">
              <AudioLines size={19} />
            </span>
          }
          title="Trending Afrobeats"
          subtitle="Audius genre trending from real artists — Afrobeats, world and reggae. Not an official chart."
        >
          <span className="audius-source">Verified/established artists · provider-based</span>
          <RefreshButton feed={afrobeats} label="Audius Afrobeats picks" />
        </SectionHead>
        {tracksFor(afrobeats, "No Afrobeats tracks are available from Audius right now.")}
      </section>

      <section className="section audius-section" id="audius-new">
        <SectionHead
          eyebrow={
            <span className="eyebrow-icon eyebrow-icon--gold">
              <AudioLines size={19} />
            </span>
          }
          title="Fresh on Audius"
          subtitle="The latest tracks published on Audius."
        >
          <RefreshButton feed={latest} label="Audius new releases" />
        </SectionHead>
        {tracksFor(latest, "No new releases are available from Audius right now.")}
      </section>

      <section className="section audius-section" id="audius-artists">
        <SectionHead
          eyebrow={
            <span className="eyebrow-icon">
              <AudioLines size={19} />
            </span>
          }
          title="Musicians on Audius"
          subtitle="Verified and established artists ranked by Audius — not one-off uploads."
        >
          <RefreshButton feed={artists} label="Audius popular artists" />
        </SectionHead>
        {cardsFor(artists, "artist", onOpenArtist, "No artists are available from Audius right now.")}
      </section>

      <section className="section audius-section" id="audius-albums">
        <SectionHead
          eyebrow={
            <span className="eyebrow-icon eyebrow-icon--blue">
              <AudioLines size={19} />
            </span>
          }
          title="Albums on Audius"
          subtitle="Albums trending on Audius this week."
        >
          <RefreshButton feed={albums} label="Audius trending albums" />
        </SectionHead>
        {cardsFor(albums, "album", onOpenAlbum, "No albums are available from Audius right now.")}
      </section>
    </div>
  );
}
