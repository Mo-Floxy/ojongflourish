import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Disc3,
  ExternalLink,
  Music2,
  Play,
  RefreshCw,
} from "lucide-react";
import AudiusImage from "./AudiusImage";
import Equalizer from "./Equalizer";
import SpotifyEmbed from "./SpotifyEmbed";
import { getCollectionTracks } from "../services/audius";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import { useSpotifyContext } from "../context/SpotifyContext";

const FALLBACK_ART = "/images/covers/orb.jpg";

function formatTime(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) return "—";
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatReleaseDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function cleanSpotifyId(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) {
    const parts = text.split("?")[0].split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }
  return text;
}

function TrackRow({ track, index, currentId, playing, onPlay }) {
  const active = Boolean(track?.id) && String(currentId) === String(track.id);

  return (
    <div className={`detail-track ${active ? "is-active" : ""}`}>
      <span className="detail-track__index" aria-hidden="true">
        {active ? (
          <Equalizer bars={3} animated={playing} barWidth={2} />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>
      <AudiusImage
        artwork={track.artwork}
        alt={`${track.title} cover`}
        className="detail-track__art"
        fallback={FALLBACK_ART}
        size="150x150"
      />
      <span className="detail-track__meta">
        <span className="detail-track__title">{track.title}</span>
        <span className="detail-track__artist">{track.artist}</span>
      </span>
      <span className="detail-track__time">{formatTime(track.duration)}</span>
      <button
        type="button"
        className={`detail-track__play ${active ? "is-active" : ""}`}
        onClick={() => onPlay(track)}
        aria-label={`Play ${track.title}`}
        title={`Play ${track.title}`}
      >
        <Play size={15} fill="currentColor" />
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="detail-page detail-page--loading" aria-busy="true" aria-live="polite">
      <div className="detail-skeleton detail-skeleton--hero">
        <div className="detail-sk detail-sk--art" />
        <div className="detail-sk-lines">
          <div className="detail-sk detail-sk--pill" />
          <div className="detail-sk detail-sk--title" />
          <div className="detail-sk detail-sk--line" />
          <div className="detail-sk detail-sk--line detail-sk--short" />
          <div className="detail-sk detail-sk--buttons" />
        </div>
      </div>
      <div className="detail-skeleton detail-skeleton--list">
        <div className="detail-sk detail-sk--heading" />
        {[0, 1, 2, 3].map((row) => (
          <div className="detail-sk-row" key={row}>
            <div className="detail-sk detail-sk--thumb" />
            <div className="detail-sk detail-sk--rowline" />
          </div>
        ))}
      </div>
      <span className="detail-sr-only">Loading collection…</span>
    </section>
  );
}

export default function AlbumPage() {
  const { source, id } = useParams();
  const location = useLocation();
  const { playTrack, playTracks, currentId, playing, pauseAudio, setSource } = usePlayer();
  const spotify = useSpotifyContext();
  const { isAlbumSaved, toggleSavedAlbum } = useLibrary();
  const [trackData, setTrackData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const supported = source === "audius";
  const stateAlbum = location.state?.album;
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const spotifyId = cleanSpotifyId(location.state?.spotifyId || searchParams.get("spotify"));
  const requestedType = location.state?.spotifyType || searchParams.get("spotifyType");
  const spotifyType = ["track", "playlist", "artist"].includes(requestedType) ? requestedType : "album";

  useEffect(() => {
    if (!supported || !id) return undefined;

    const controller = new AbortController();
    let live = true;
    setStatus("loading");
    setError("");
    setTrackData(null);

    getCollectionTracks(id, { signal: controller.signal })
      .then((tracks) => {
        if (!live || controller.signal.aborted) return;
        setTrackData(tracks || []);
        setStatus("ready");
      })
      .catch((reason) => {
        if (!live || controller.signal.aborted || reason?.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Audius could not load this collection.");
        setStatus("error");
      });

    return () => {
      live = false;
      controller.abort();
    };
  }, [id, supported, reloadKey]);

  const tracks = useMemo(() => (trackData || []).filter((track) => track?.id), [trackData]);
  const firstTrack = tracks[0] || null;

  // Metadata is never invented: use navigation state when supplied, otherwise
  // fall back to the albumBacklink Audius attached to the first track.
  const album = useMemo(() => {
    const backlink = firstTrack?.raw?.album_backlink || {};
    if (stateAlbum && typeof stateAlbum === "object" && stateAlbum.id) {
      return {
        id: String(stateAlbum.id),
        source: "audius",
        title: stateAlbum.title || backlink.playlist_name || "Untitled collection",
        artist: stateAlbum.artist || firstTrack?.artist || "Unknown artist",
        artistId: stateAlbum.artistId || firstTrack?.artistId || "",
        artwork: stateAlbum.artwork || backlink.artwork || firstTrack?.artwork || null,
        cover: stateAlbum.cover || "",
        description: stateAlbum.description || "",
        trackCount: Number(stateAlbum.trackCount) || 0,
        releaseDate: stateAlbum.releaseDate || "",
        permalink: stateAlbum.permalink || "",
      };
    }

    return {
      id: String(firstTrack?.albumId || id || ""),
      source: "audius",
      title: backlink.playlist_name || firstTrack?.album || "Untitled collection",
      artist: firstTrack?.artist || "Unknown artist",
      artistId: firstTrack?.artistId || "",
      artwork: backlink.artwork || firstTrack?.artwork || null,
      cover: firstTrack?.cover || "",
      description: "",
      trackCount: 0,
      releaseDate: "",
      permalink: "",
    };
  }, [stateAlbum, firstTrack, id]);

  if (!supported) {
    return (
      <section className="detail-page" aria-labelledby="detail-unsupported-album">
        <div className="detail-card detail-notice">
          <span className="detail-notice__icon" aria-hidden="true">
            <Disc3 size={26} />
          </span>
          <h1 id="detail-unsupported-album">Albums from this source aren’t available yet</h1>
          <p>
            VYRA can open detailed album tracklists from Audius right now. Head back to search and
            choose an Audius release.
          </p>
          <div className="detail-notice__actions">
            <Link className="btn-vyra" to="/search">
              <ArrowLeft size={16} /> Back to search
            </Link>
            <Link className="btn-ghost" to="/">
              Go home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === "loading" || !id) return <LoadingState />;

  if (status === "error") {
    return (
      <section className="detail-page" aria-labelledby="detail-album-error">
        <div className="detail-card detail-notice detail-notice--error" role="alert">
          <span className="detail-notice__icon" aria-hidden="true">
            <AlertCircle size={26} />
          </span>
          <h1 id="detail-album-error">We couldn’t load this album</h1>
          <p>{error}</p>
          <div className="detail-notice__actions">
            <button type="button" className="btn-vyra" onClick={() => setReloadKey((key) => key + 1)}>
              <RefreshCw size={16} /> Try again
            </button>
            <Link className="btn-ghost" to="/search">
              Back to search
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const saved = isAlbumSaved(album);
  const providerCount = Number(album.trackCount);
  const displayCount = Number.isFinite(providerCount) && providerCount > 0 ? providerCount : tracks.length;
  const releaseDate = formatReleaseDate(album.releaseDate);
  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(
    `${album.title} ${album.artist}`.trim()
  )}`;
  const suppliedSpotifyUrl = location.state?.spotifyUrl || searchParams.get("spotifyUrl");
  const officialSpotifyUrl =
    typeof suppliedSpotifyUrl === "string" && /^https:\/\/open\.spotify\.com\//i.test(suppliedSpotifyUrl)
      ? suppliedSpotifyUrl
      : spotifySearchUrl;

  return (
    <section className="detail-page detail-page--album">
      <div className="detail-back-row">
        {album.artistId ? (
          <Link className="detail-back" to={`/artist/audius/${encodeURIComponent(album.artistId)}`}>
            <ArrowLeft size={14} /> Back to artist
          </Link>
        ) : (
          <Link className="detail-back" to="/search">
            <ArrowLeft size={14} /> Back to search
          </Link>
        )}
      </div>

      <header className="detail-hero detail-hero--album">
        <div className="detail-hero__art detail-hero__art--square">
          <AudiusImage
            artwork={album.artwork}
            alt={`${album.title} cover art`}
            className="detail-hero__image"
            fallback={album.cover || FALLBACK_ART}
            size="480x480"
          />
          <span className="detail-hero__ring" aria-hidden="true" />
        </div>

        <div className="detail-hero__body">
          <div className="detail-hero__eyebrow">
            <span className="detail-pill">Audius collection</span>
          </div>
          <h1 className="detail-hero__title">{album.title}</h1>
          <p className="detail-hero__artist">{album.artist}</p>
          {album.description ? <p className="detail-hero__bio">{album.description}</p> : null}

          <div className="detail-hero__meta">
            {displayCount > 0 ? (
              <span className="detail-meta">
                <Music2 size={14} /> {displayCount} {displayCount === 1 ? "song" : "songs"}
              </span>
            ) : null}
            {releaseDate ? <span className="detail-meta">Released {releaseDate}</span> : null}
          </div>

          <div className="detail-hero__actions">
            <button
              type="button"
              className="btn-vyra detail-action"
              onClick={() => playTracks(tracks, 0)}
              disabled={!tracks.length}
            >
              <span className="btn-vyra__icon" aria-hidden="true">
                <Play size={14} fill="currentColor" />
              </span>
              Play album
            </button>
            <button
              type="button"
              className={`btn-ghost detail-action ${saved ? "is-saved" : ""}`}
              onClick={() => toggleSavedAlbum(album)}
              disabled={!album.id}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? "Saved album" : "Save album"}
            </button>
            <a className="detail-link" href={officialSpotifyUrl} target="_blank" rel="noopener noreferrer">
              {officialSpotifyUrl === spotifySearchUrl ? "Find this album on Spotify" : "Open in Spotify"}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            {album.permalink ? (
              <a className="detail-link detail-link--muted" href={album.permalink} target="_blank" rel="noopener noreferrer">
                View on Audius <ExternalLink size={13} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="detail-section" aria-labelledby="detail-tracklist-title">
        <div className="detail-section__head">
          <div>
            <h2 id="detail-tracklist-title">Tracklist</h2>
            <p>Stream the tracks from this Audius collection.</p>
          </div>
          {tracks.length ? (
            <button type="button" className="detail-text-btn" onClick={() => playTracks(tracks, 0)}>
              <Play size={13} fill="currentColor" /> Play album
            </button>
          ) : null}
        </div>

        {tracks.length ? (
          <div className="detail-tracklist">
            {tracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                currentId={currentId}
                playing={playing}
                onPlay={playTrack}
              />
            ))}
          </div>
        ) : (
          <div className="detail-empty">This collection doesn’t have any playable tracks yet.</div>
        )}
      </section>

      {spotifyId ? (
        <section className="detail-section" aria-labelledby="detail-embed-title">
          <div className="detail-section__head">
            <div>
              <h2 id="detail-embed-title">Spotify preview</h2>
              <p>Embedded from the Spotify ID supplied with this page.</p>
            </div>
          </div>
          <div className="detail-embed">
            <SpotifyEmbed
              type={spotifyType}
              id={spotifyId}
              height={352}
              title={`${album.title} on Spotify`}
              onPlay={() => {
                pauseAudio();
                setSource("embed");
                spotify.pause?.();
              }}
            />
          </div>
        </section>
      ) : null}

      <p className="detail-source-note">
        <Disc3 size={14} aria-hidden="true" /> Track data comes from Audius. The Spotify link opens a
        search in a new tab; no Spotify data is loaded unless an embed is shown above.
      </p>
    </section>
  );
}
