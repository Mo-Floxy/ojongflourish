import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Disc3,
  ExternalLink,
  Music2,
  Play,
  RefreshCw,
  Users,
} from "lucide-react";
import AudiusImage from "./AudiusImage";
import Equalizer from "./Equalizer";
import { getArtistProfile } from "../services/audius";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

const FALLBACK_ART = "/images/covers/artist-1.jpg";

function formatTime(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) return "—";
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
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

function CollectionCard({ item, kind }) {
  const href = `/album/audius/${encodeURIComponent(item.id)}`;
  const label = kind === "playlist" ? "Playlist" : item.isAlbum ? "Album" : "Single";

  return (
    <Link className="detail-media-card" to={href} aria-label={`Open ${item.title}`}>
      <span className="detail-media-card__art">
        <AudiusImage
          artwork={item.artwork}
          alt={`${item.title} cover`}
          className="detail-media-card__image"
          fallback={FALLBACK_ART}
          size="480x480"
        />
        <span className="detail-media-card__play" aria-hidden="true">
          <Play size={14} fill="currentColor" />
        </span>
      </span>
      <span className="detail-media-card__body">
        <span className="detail-media-card__title">{item.title}</span>
        <span className="detail-media-card__sub">
          {label}
          {Number(item.trackCount) > 0 ? ` · ${item.trackCount} songs` : ""}
        </span>
      </span>
    </Link>
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
      <span className="detail-sr-only">Loading artist profile…</span>
    </section>
  );
}

export default function ArtistPage() {
  const { source, id } = useParams();
  const { playTrack, playTracks, currentId, playing } = usePlayer();
  const { isArtistSaved, toggleSavedArtist } = useLibrary();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const supported = source === "audius";

  useEffect(() => {
    if (!supported || !id) return undefined;

    const controller = new AbortController();
    let live = true;
    setStatus("loading");
    setError("");
    setProfile(null);

    getArtistProfile(id, { signal: controller.signal })
      .then((result) => {
        if (!live || controller.signal.aborted) return;
        setProfile(result || {});
        setStatus("ready");
      })
      .catch((reason) => {
        if (!live || controller.signal.aborted || reason?.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Audius could not load this artist.");
        setStatus("error");
      });

    return () => {
      live = false;
      controller.abort();
    };
  }, [id, supported, reloadKey]);

  const tracks = useMemo(() => (profile?.tracks || []).filter((track) => track?.id), [profile]);
  const albums = useMemo(() => (profile?.albums || []).filter((item) => item?.id), [profile]);
  const playlists = useMemo(() => (profile?.playlists || []).filter((item) => item?.id), [profile]);

  if (!supported) {
    return (
      <section className="detail-page" aria-labelledby="detail-unsupported-artist">
        <div className="detail-card detail-notice">
          <span className="detail-notice__icon" aria-hidden="true">
            <Music2 size={26} />
          </span>
          <h1 id="detail-unsupported-artist">Artist pages from this source aren’t available yet</h1>
          <p>
            VYRA can open detailed artist profiles from Audius right now. Head back to search and
            pick an Audius artist to explore their music.
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
      <section className="detail-page" aria-labelledby="detail-artist-error">
        <div className="detail-card detail-notice detail-notice--error" role="alert">
          <span className="detail-notice__icon" aria-hidden="true">
            <AlertCircle size={26} />
          </span>
          <h1 id="detail-artist-error">We couldn’t load this artist</h1>
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

  const artist = profile?.artist || {};
  const hasArtist = Boolean(artist.id);
  const saved = isArtistSaved(artist);
  const verified = Boolean(artist.verified ?? artist.isVerified);
  const followerCount = Number(artist.followerCount);
  const showFollowers = Number.isFinite(followerCount) && followerCount > 0;
  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(artist.name || "artist")}`;

  if (!hasArtist && !tracks.length && !albums.length && !playlists.length) {
    return (
      <section className="detail-page" aria-labelledby="detail-artist-empty">
        <div className="detail-card detail-notice">
          <span className="detail-notice__icon" aria-hidden="true">
            <Music2 size={26} />
          </span>
          <h1 id="detail-artist-empty">Nothing published here yet</h1>
          <p>Audius didn’t return a profile for this artist. Try another artist from search.</p>
          <div className="detail-notice__actions">
            <Link className="btn-vyra" to="/search">
              <ArrowLeft size={16} /> Back to search
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-page detail-page--artist">
      <Link className="detail-back" to="/search">
        <ArrowLeft size={14} /> Back to search
      </Link>

      <header className="detail-hero detail-hero--artist">
        <div className="detail-hero__art">
          <AudiusImage
            artwork={artist.artwork}
            alt={`${artist.name} artist artwork`}
            className="detail-hero__image"
            fallback={FALLBACK_ART}
            size="480x480"
          />
          <span className="detail-hero__ring" aria-hidden="true" />
        </div>

        <div className="detail-hero__body">
          <div className="detail-hero__eyebrow">
            <span className="detail-pill">Audius artist</span>
            {verified ? (
              <span className="detail-pill detail-pill--verified">
                <BadgeCheck size={13} /> Verified
              </span>
            ) : null}
          </div>

          <h1 className="detail-hero__title">{artist.name || "Unknown artist"}</h1>
          {artist.handle ? <p className="detail-hero__handle">@{String(artist.handle).replace(/^@/, "")}</p> : null}
          {artist.bio ? <p className="detail-hero__bio">{artist.bio}</p> : null}

          <div className="detail-hero__meta">
            {showFollowers ? (
              <span className="detail-meta">
                <Users size={14} /> {followerCount.toLocaleString()} followers
              </span>
            ) : null}
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
              Play all
            </button>
            <button
              type="button"
              className={`btn-ghost detail-action ${saved ? "is-saved" : ""}`}
              onClick={() => toggleSavedArtist(artist)}
              disabled={!artist.id}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? "Saved artist" : "Save artist"}
            </button>
            <a className="detail-link" href={spotifyUrl} target="_blank" rel="noopener noreferrer">
              Find on Spotify <ExternalLink size={13} aria-hidden="true" />
            </a>
            {artist.permalink ? (
              <a className="detail-link detail-link--muted" href={artist.permalink} target="_blank" rel="noopener noreferrer">
                View on Audius <ExternalLink size={13} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="detail-section" aria-labelledby="detail-popular-title">
        <div className="detail-section__head">
          <div>
            <h2 id="detail-popular-title">Popular songs</h2>
            <p>Play the tracks this artist has shared on Audius.</p>
          </div>
          {tracks.length ? (
            <button type="button" className="detail-text-btn" onClick={() => playTracks(tracks, 0)}>
              <Play size={13} fill="currentColor" /> Play all
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
          <div className="detail-empty">No tracks have been published by this artist yet.</div>
        )}
      </section>

      <section className="detail-section" aria-labelledby="detail-albums-title">
        <div className="detail-section__head">
          <div>
            <h2 id="detail-albums-title">Albums &amp; singles</h2>
            <p>Open a release to see its full tracklist.</p>
          </div>
        </div>
        {albums.length ? (
          <div className="detail-card-grid">
            {albums.map((album) => (
              <CollectionCard key={album.id} item={album} kind="album" />
            ))}
          </div>
        ) : (
          <div className="detail-empty">No albums or singles have been published yet.</div>
        )}
      </section>

      {playlists.length ? (
        <section className="detail-section" aria-labelledby="detail-playlists-title">
          <div className="detail-section__head">
            <div>
              <h2 id="detail-playlists-title">Playlists</h2>
              <p>More collections from this artist.</p>
            </div>
          </div>
          <div className="detail-card-grid">
            {playlists.map((playlist) => (
              <CollectionCard key={playlist.id} item={playlist} kind="playlist" />
            ))}
          </div>
        </section>
      ) : null}

      <p className="detail-source-note">
        <Disc3 size={14} aria-hidden="true" /> Artist data comes from Audius. Spotify links open a
        search in a new tab; no Spotify data is loaded here.
      </p>
    </section>
  );
}
