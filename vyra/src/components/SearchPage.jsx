import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, Play, Search, X } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useSpotifyContext } from "../context/SpotifyContext";
import { searchAudius } from "../services/audius";
import { formatTime } from "../data/music";
import SpotifyEmbed from "./SpotifyEmbed";
import { SpotifyLogo } from "./SpotifyConnectDialog";
import "../styles/search.css";
import "../styles/spotify.css";

const EMPTY_RESULTS = { tracks: [], artists: [], albums: [], playlists: [] };

const TABS = [
  { id: "all", label: "All" },
  { id: "songs", label: "Songs" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
  { id: "playlists", label: "Playlists" },
];

const spotifyImage = (item) =>
  item?.images?.[0]?.url ||
  item?.album?.images?.at(-1)?.url ||
  item?.album?.images?.[0]?.url ||
  "";

const spotifyUrl = (item) => item?.external_urls?.spotify || "";

function Section({ title, count, children }) {
  return (
    <section className="search-page__section">
      <div className="search-page__section-head">
        <h2>{title}</h2>
        <span>{count}</span>
      </div>
      {children}
    </section>
  );
}

function Skeletons() {
  return (
    <div className="search-page__skeletons" aria-label="Loading results" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="search-page__skeleton">
          <span className="search-page__skeleton-art" />
          <span className="search-page__skeleton-lines">
            <i />
            <i />
          </span>
        </div>
      ))}
    </div>
  );
}

function AudiusTrackRow({ track, onPlay }) {
  return (
    <div className="search-page__track">
      <button type="button" className="search-page__play" onClick={onPlay} aria-label={`Play ${track.title}`}>
        <Play size={14} fill="currentColor" />
      </button>
      <img src={track.cover} alt="" className="search-page__art" loading="lazy" />
      <div className="search-page__track-meta">
        <span className="search-page__row-title">{track.title}</span>
        <span className="search-page__row-sub">
          {track.artistId ? (
            <Link to={`/artist/audius/${track.artistId}`}>{track.artist}</Link>
          ) : (
            track.artist
          )}
          {track.albumId ? ` · ` : ""}
          {track.albumId && <Link to={`/album/audius/${track.albumId}`}>{track.album}</Link>}
        </span>
      </div>
      <div className="search-page__actions">
        <span className="search-page__source">Audius</span>
        <span className="search-page__time">{formatTime(track.duration)}</span>
      </div>
    </div>
  );
}

function SpotifyTrackRow({ track, onEmbed, onPlay, playbackReady }) {
  const url = spotifyUrl(track);
  return (
    <div className="search-page__track">
      {playbackReady ? (
        <button
          type="button"
          className="search-page__play"
          onClick={() => onPlay?.(track)}
          aria-label={`Play ${track.name} on Spotify`}
        >
          <Play size={14} fill="currentColor" />
        </button>
      ) : (
        <span className="search-page__art--wrap">
          <img src={spotifyImage(track)} alt="" loading="lazy" />
        </span>
      )}
      <div className="search-page__track-meta">
        <span className="search-page__row-title">{track.name}</span>
        <span className="search-page__row-sub">
          {track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist"} · Spotify
          {track.album?.name ? ` · ${track.album.name}` : ""}
          {track.explicit ? " · E" : ""}
        </span>
      </div>
      <div className="search-page__actions">
        {url ? (
          <a className="search-page__pill" href={url} target="_blank" rel="noreferrer">
            Open in Spotify <ExternalLink size={12} />
          </a>
        ) : (
          <span className="search-page__pill">Unavailable</span>
        )}
        <button
          type="button"
          className="search-page__pill search-page__pill--ghost"
          onClick={() =>
            onEmbed({
              type: "track",
              id: track.id,
              title: track.name,
              height: 152,
            })
          }
        >
          Embed
        </button>
      </div>
    </div>
  );
}

function CollectionCard({ item, onEmbed }) {
  const isAudius = item.source === "audius";
  const title = isAudius ? item.title : item.name;
  const subtitle = isAudius
    ? `${item.artist || "Audius"}${item.trackCount ? ` · ${item.trackCount} tracks` : ""}`
    : `${item.owner?.display_name || "Spotify"}${item.tracks?.total ? ` · ${item.tracks.total} tracks` : ""}`;
  const image = isAudius ? item.cover : spotifyImage(item);
  const url = spotifyUrl(item);

  if (isAudius) {
    return (
      <Link className="search-page__card" to={`/album/audius/${item.id}`}>
        <img className="search-page__card-art" src={image} alt="" loading="lazy" />
        <span className="search-page__card-name">{title}</span>
        <span className="search-page__card-sub">{subtitle}</span>
      </Link>
    );
  }

  return (
    <div className="search-page__card">
      <img className="search-page__card-art" src={image} alt="" loading="lazy" />
      <span className="search-page__card-name">{title}</span>
      <span className="search-page__card-sub">{subtitle}</span>
      <div className="search-page__card-actions">
        {url && (
          <a className="search-page__pill" href={url} target="_blank" rel="noreferrer">
            Open in Spotify <ExternalLink size={12} />
          </a>
        )}
        <button
          type="button"
          className="search-page__pill search-page__pill--ghost"
          onClick={() =>
            onEmbed({
              type: item.type === "playlist" ? "playlist" : "album",
              id: item.id,
              title,
              height: 352,
            })
          }
        >
          Embed
        </button>
      </div>
    </div>
  );
}

function ArtistCard({ artist, onEmbed }) {
  const isAudius = artist.source === "audius";
  const image = isAudius ? artist.coverImage : spotifyImage(artist);
  const subtitle = isAudius
    ? `${artist.followerCount || 0} followers`
    : `Spotify artist${artist.followers?.total ? ` · ${artist.followers.total.toLocaleString()} followers` : ""}`;
  const url = spotifyUrl(artist);

  if (isAudius) {
    return (
      <Link className="search-page__card search-page__card--round" to={`/artist/audius/${artist.id}`}>
        <img className="search-page__card-art" src={image} alt="" loading="lazy" />
        <span className="search-page__card-name">{artist.name}</span>
        <span className="search-page__card-sub">{subtitle}</span>
      </Link>
    );
  }

  return (
    <div className="search-page__card search-page__card--round">
      <img className="search-page__card-art" src={image} alt="" loading="lazy" />
      <span className="search-page__card-name">{artist.name}</span>
      <span className="search-page__card-sub">{subtitle}</span>
      <div className="search-page__card-actions">
        {url && (
          <a className="search-page__pill" href={url} target="_blank" rel="noreferrer">
            Open in Spotify <ExternalLink size={12} />
          </a>
        )}
        <button
          type="button"
          className="search-page__pill search-page__pill--ghost"
          onClick={() =>
            onEmbed({
              type: "artist",
              id: artist.id,
              title: artist.name,
              height: 352,
            })
          }
        >
          Embed
        </button>
      </div>
    </div>
  );
}

export default function SearchPage({ onPlaySpotifyTrack, onOpenSpotify }) {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const [term, setTerm] = useState(urlQuery);
  const [tab, setTab] = useState("all");
  const [data, setData] = useState({ audius: EMPTY_RESULTS, spotify: EMPTY_RESULTS });
  const [loading, setLoading] = useState(Boolean(urlQuery));
  const [errors, setErrors] = useState({ audius: "", spotify: "" });
  const [embed, setEmbed] = useState(null);
  const [spotifyNoteDismissed, setSpotifyNoteDismissed] = useState(false);
  const player = usePlayer();
  const spotify = useSpotifyContext();
  const spotifyReady = spotify.configured && spotify.authenticated;
  const playbackReady = spotifyReady && spotify.playerReady;

  // Keep the field in sync when the URL changes elsewhere (e.g. TopBar).
  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  // Debounce the field, then mirror the committed term into the URL.
  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (term) next.set("q", term);
        else next.delete("q");
        return next;
      },
      { replace: true }
    );
  }, [term, setParams]);

  useEffect(() => {
    if (!term) {
      setData({ audius: EMPTY_RESULTS, spotify: EMPTY_RESULTS });
      setErrors({ audius: "", spotify: "" });
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setErrors({ audius: "", spotify: "" });

    const audiusRequest = searchAudius(term, { kind: "all", limit: 12, signal: controller.signal })
      .then((value) => ({ value, error: "" }))
      .catch((reason) => ({
        value: EMPTY_RESULTS,
        error: reason instanceof Error ? reason.message : String(reason),
      }));

    const spotifyRequest = spotifyReady
      ? spotify
          .searchCatalog(term, { limit: 12, signal: controller.signal })
          .then((value) => ({ value, error: "" }))
          .catch((reason) => ({
            value: EMPTY_RESULTS,
            error: reason instanceof Error ? reason.message : String(reason),
          }))
      : Promise.resolve({ value: EMPTY_RESULTS, error: "" });

    Promise.all([audiusRequest, spotifyRequest]).then(([audius, spotifyResult]) => {
      if (!active || controller.signal.aborted) return;
      setData({ audius: audius.value || EMPTY_RESULTS, spotify: spotifyResult.value || EMPTY_RESULTS });
      setErrors({
        audius: audius.error,
        spotify: spotifyResult.error,
      });
      setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [term, spotifyReady, spotify.searchCatalog]);

  const songs = [
    ...data.audius.tracks.map((track) => ({ ...track, _source: "audius" })),
    ...data.spotify.tracks.map((track) => ({ ...track, _source: "spotify" })),
  ];
  const artists = [
    ...data.audius.artists.map((artist) => ({ ...artist, _source: "audius" })),
    ...data.spotify.artists.map((artist) => ({ ...artist, _source: "spotify" })),
  ];
  const collections = [
    ...data.audius.albums.map((album) => ({ ...album, _source: "audius", _kind: "album" })),
    ...data.spotify.albums.map((album) => ({ ...album, _source: "spotify", _kind: "album" })),
    ...data.audius.playlists.map((playlist) => ({ ...playlist, _source: "audius", _kind: "playlist" })),
    ...data.spotify.playlists.map((playlist) => ({ ...playlist, _source: "spotify", _kind: "playlist" })),
  ];

  const isVisible = (key) => tab === "all" || tab === key;
  const hasAny = songs.length + artists.length + collections.length > 0;
  const hasError = Boolean(errors.audius || errors.spotify);

  const handleEmbedPlay = () => {
    player.pauseAudio();
    player.setSource("embed");
    spotify.pause?.();
  };

  return (
    <div className="search-page">
      <div className="search-page__head">
        <div>
          <p className="search-page__eyebrow">Discover</p>
          <h1>Search VYRA</h1>
          <p className="search-page__intro">
            Find songs, artists, albums and playlists across Audius and Spotify.
          </p>
        </div>
        <form className="search-page__field" onSubmit={(event) => event.preventDefault()}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="What do you want to listen to?"
            aria-label="Search music"
            autoComplete="off"
          />
          {input && (
            <button
              type="button"
              className="search-page__clear"
              onClick={() => setInput("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>
      </div>

      <div className="search-page__tabs" role="tablist" aria-label="Search filters">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`search-page__tab ${tab === item.id ? "is-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!spotifyReady && !spotifyNoteDismissed && (
        <div className="search-page__note search-page__note--spotify">
          <SpotifyLogo size={18} />
          <span>
            Spotify search is optional. Connect to see real Spotify tracks, artists, albums and
            playlists here; Audius results keep working either way.
          </span>
          <div className="search-page__note-actions">
            <button type="button" onClick={onOpenSpotify}>Connect Spotify</button>
            <button
              type="button"
              className="is-quiet"
              onClick={() => setSpotifyNoteDismissed(true)}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {errors.audius && (
        <p className="search-page__error" role="alert">
          {errors.audius.startsWith("Audius:") ? errors.audius : `Audius: ${errors.audius}`}
        </p>
      )}
      {(errors.spotify || (spotify.status === "error" && spotify.error)) && (
        <p className="search-page__error" role="alert">
          {`Spotify: ${errors.spotify || spotify.error}`}
        </p>
      )}

      {loading && <Skeletons />}

      {!loading && !term && (
        <div className="search-page__empty">
          <span className="search-page__empty-icon">
            <Search size={22} />
          </span>
          <h3>What should we play?</h3>
          <p>Search for a song, artist, album or playlist to start exploring across VYRA.</p>
        </div>
      )}

      {!loading && term && !hasAny && (
        <div className="search-page__empty">
          <span className="search-page__empty-icon">
            <Search size={22} />
          </span>
          <h3>No results for “{term}”</h3>
          <p>
            {hasError
              ? "One of the music services could not be reached. Check the message above and try another search."
              : "Try a different spelling, another artist, or a broader search term."}
          </p>
        </div>
      )}

      {!loading && isVisible("songs") && songs.length > 0 && (
        <Section title="Songs" count={`${songs.length} results`}>
          <div className="search-page__list">
            {songs.map((track, index) =>
              track._source === "audius" ? (
                <AudiusTrackRow
                  key={`audius-track-${track.id}`}
                  track={track}
                  onPlay={() => player.playTracks(data.audius.tracks, index)}
                />
              ) : (
                <SpotifyTrackRow
                  key={`spotify-track-${track.id}`}
                  track={track}
                  onEmbed={setEmbed}
                  onPlay={onPlaySpotifyTrack}
                  playbackReady={playbackReady}
                />
              )
            )}
          </div>
        </Section>
      )}

      {!loading && isVisible("artists") && artists.length > 0 && (
        <Section title="Artists" count={`${artists.length} results`}>
          <div className="search-page__grid">
            {artists.map((artist) => (
              <ArtistCard
                key={`${artist._source}-artist-${artist.id}`}
                artist={artist}
                onEmbed={setEmbed}
              />
            ))}
          </div>
        </Section>
      )}

      {!loading && isVisible("albums") && collections.filter((item) => item._kind === "album").length > 0 && (
        <Section
          title="Albums"
          count={`${collections.filter((item) => item._kind === "album").length} results`}
        >
          <div className="search-page__grid">
            {collections
              .filter((item) => item._kind === "album")
              .map((album) => (
                <CollectionCard
                  key={`${album._source}-album-${album.id}`}
                  item={album}
                  onEmbed={setEmbed}
                />
              ))}
          </div>
        </Section>
      )}

      {!loading && isVisible("playlists") && collections.filter((item) => item._kind === "playlist").length > 0 && (
        <Section
          title="Playlists"
          count={`${collections.filter((item) => item._kind === "playlist").length} results`}
        >
          <div className="search-page__grid">
            {collections
              .filter((item) => item._kind === "playlist")
              .map((playlist) => (
                <CollectionCard
                  key={`${playlist._source}-playlist-${playlist.id}`}
                  item={playlist}
                  onEmbed={setEmbed}
                />
              ))}
          </div>
        </Section>
      )}

      <AnimatePresence>
        {embed && (
          <motion.div
            className="search-page__embed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="search-page__embed-head">
              <h3>{embed.title}</h3>
              <button
                type="button"
                className="search-page__embed-close"
                onClick={() => setEmbed(null)}
                aria-label="Close Spotify embed"
              >
                <X size={15} />
              </button>
            </div>
            <SpotifyEmbed
              type={embed.type}
              id={embed.id}
              height={embed.height}
              title={embed.title}
              onPlay={handleEmbedPlay}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
