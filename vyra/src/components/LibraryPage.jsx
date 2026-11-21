import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Disc3,
  Heart,
  History,
  ListMusic,
  Pause,
  Play,
  Users,
  X,
} from "lucide-react";
import SectionHead from "./SectionHead";
import AudiusImage from "./AudiusImage";
import Equalizer from "./Equalizer";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { TRACKS, formatTime } from "../data/music";

const DEFAULT_ART = "/images/covers/genre-afrobeats.jpg";

const LOCAL_TRACKS = TRACKS.map((track) => ({
  ...track,
  source: "local",
  sourceId: track.id,
  src: track.src,
}));

const LOCAL_BY_ID = new Map(LOCAL_TRACKS.map((track) => [String(track.id), track]));

const TABS = [
  { id: "liked", label: "Liked Songs", icon: Heart },
  { id: "albums", label: "Saved Albums", icon: Disc3 },
  { id: "artists", label: "Saved Artists", icon: Users },
  { id: "recent", label: "Recently Played", icon: History },
];

const VALID_TABS = new Set(TABS.map((tab) => tab.id));

const sourceOf = (item) => (item?.source === "audius" ? "audius" : "local");

function artFallback(track) {
  const value = [track?.cover, track?.coverImage, track?.artwork].find(
    (item) => typeof item === "string" && item
  );
  return value || DEFAULT_ART;
}

function normalizeTrack(track) {
  if (!track?.id) return null;
  const id = String(track.id);

  if (track.source === "audius") {
    return {
      ...track,
      id,
      source: "audius",
      sourceId: track.sourceId || id,
      src: track.src || "",
    };
  }

  const local = LOCAL_BY_ID.get(id);
  return {
    ...(local || {}),
    ...track,
    id,
    source: "local",
    sourceId: id,
    src: track.src || local?.src || "",
  };
}

function resolveLikedTrack(rawId, likedTracks, queue) {
  const id = String(rawId);
  if (!id) return null;

  const stored =
    likedTracks?.[id] ||
    Object.values(likedTracks || {}).find((track) => String(track?.id) === id);
  const storedSource = stored ? sourceOf(stored) : null;
  const local = LOCAL_BY_ID.get(id);
  const queued = (queue || []).find(
    (track) =>
      String(track?.id) === id && (!storedSource || sourceOf(track) === storedSource)
  );

  const seed =
    storedSource === "audius"
      ? { ...stored, ...(queued || {}) }
      : { ...(local || {}), ...(stored || {}), ...(queued || {}) };

  if (!seed.id) return null;
  return normalizeTrack({ ...seed, id });
}

function formatCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : "0";
}

function TrackArt({ track, className }) {
  if (sourceOf(track) === "audius") {
    return (
      <AudiusImage
        artwork={track.artwork}
        alt=""
        className={className}
        fallback={artFallback(track)}
        size="300x300"
      />
    );
  }
  return (
    <img
      className={className}
      src={artFallback(track)}
      alt=""
      loading="lazy"
    />
  );
}

function LibraryEmpty({ icon: Icon, title, children }) {
  return (
    <motion.div
      className="library-empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="library-empty__icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </motion.div>
  );
}

function LibraryTrackRow({ track, index, onPlay, currentId, playing, onRemove, showSource }) {
  const active = String(currentId) === String(track.id);
  const source = sourceOf(track);

  return (
    <motion.div
      className={`library-row ${showSource ? "library-row--recent" : "library-row--liked"} ${
        active ? "is-active" : ""
      }`}
      onClick={() => onPlay(track)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.25) }}
    >
      <span className="library-row__index">
        {active && playing ? (
          <Equalizer bars={3} animated barWidth={2} />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>

      <div className="library-row__art">
        <TrackArt track={track} className="library-row__img" />
        <button
          type="button"
          className="library-row__play"
          onClick={(event) => {
            event.stopPropagation();
            onPlay(track);
          }}
          aria-label={`${active && playing ? "Pause" : "Play"} ${track.title}`}
        >
          {active && playing ? (
            <Pause size={13} fill="currentColor" />
          ) : (
            <Play size={13} fill="currentColor" />
          )}
        </button>
      </div>

      <div className="library-row__meta">
        <h4 title={track.title}>{track.title}</h4>
        <p>{track.artist}{track.album ? ` · ${track.album}` : ""}</p>
      </div>

      {showSource && (
        <span className={`library-source library-source--${source}`}>
          {source === "audius" ? "Audius" : "VYRA local"}
        </span>
      )}

      <span className="library-row__album">
        {track.album || (source === "audius" ? "Audius" : "VYRA")}
      </span>

      <span className="library-row__time">{formatTime(Number(track.duration) || 0)}</span>

      {onRemove && (
        <button
          type="button"
          className="library-row__remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(track);
          }}
          aria-label={`Remove ${track.title} from liked songs`}
          title="Remove from liked songs"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}

function SavedCard({ item, type, onToggle }) {
  const source = sourceOf(item);
  const isAudius = source === "audius";
  const isAlbum = type === "album";
  const path = isAudius
    ? `/${type}/${encodeURIComponent(item.source || "audius")}/${encodeURIComponent(item.id)}`
    : null;

  const title = isAlbum
    ? item.title || item.name || "Untitled album"
    : item.name || item.title || "Unknown artist";
  const subtitle = isAlbum
    ? item.artist || "Unknown artist"
    : item.handle
      ? `@${item.handle}`
      : "VYRA artist";
  const meta = isAlbum
    ? `${formatCount(item.trackCount || item.tracks?.length || 0)} tracks${
        item.releaseDate ? ` · ${String(item.releaseDate).slice(0, 4)}` : ""
      }`
    : `${formatCount(item.followerCount)} followers · ${formatCount(item.trackCount)} tracks`;

  const media = <TrackArt track={item} className="library-card__img" />;

  return (
    <motion.article
      className="library-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="library-card__frame">
        {path ? (
          <Link className="library-card__media" to={path} aria-label={`Open ${title}`}>
            {media}
            <span className="library-card__open">Open</span>
          </Link>
        ) : (
          <div className="library-card__media">{media}</div>
        )}
        <button
          type="button"
          className="library-card__remove"
          onClick={() => onToggle(item)}
          aria-label={`Remove ${title} from saved ${type}s`}
          aria-pressed="true"
          title="Remove from saved"
        >
          <Heart size={16} fill="currentColor" />
        </button>
      </div>
      <div className="library-card__body">
        {path ? (
          <Link className="library-card__title" to={path} title={title}>
            {title}
          </Link>
        ) : (
          <h3 className="library-card__title" title={title}>
            {title}
          </h3>
        )}
        <p className="library-card__subtitle">{subtitle}</p>
        <span className="library-card__meta">{meta}</span>
      </div>
    </motion.article>
  );
}

export function LibraryPage() {
  const player = usePlayer();
  const {
    savedAlbums,
    savedArtists,
    recentTracks,
    toggleSavedAlbum,
    toggleSavedArtist,
  } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const activeTab = VALID_TABS.has(requestedTab) ? requestedTab : "liked";

  const likedSongs = useMemo(
    () =>
      Array.from(player.liked || [])
        .map((id) => resolveLikedTrack(id, player.likedTracks, player.queue))
        .filter(Boolean),
    [player.liked, player.likedTracks, player.queue]
  );

  const albums = useMemo(
    () => Object.values(savedAlbums || {}).filter((item) => item?.id),
    [savedAlbums]
  );

  const artists = useMemo(
    () => Object.values(savedArtists || {}).filter((item) => item?.id),
    [savedArtists]
  );

  const recent = useMemo(
    () => (recentTracks || []).map(normalizeTrack).filter(Boolean),
    [recentTracks]
  );

  const counts = {
    liked: likedSongs.length,
    albums: albums.length,
    artists: artists.length,
    recent: recent.length,
  };

  const playOne = (track) => {
    const playable = normalizeTrack(track);
    if (!playable) return;
    if (String(player.currentId) === String(playable.id) && player.playing) {
      player.pauseAudio();
      return;
    }
    player.playTrack(playable);
  };

  const changeTab = (tab) => {
    if (tab !== activeTab) setSearchParams({ tab });
  };

  return (
    <div className="library-page">
      <motion.header
        className="library-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="library-hero__copy">
          <span className="library-hero__eyebrow">
            <ListMusic size={14} /> Your collection
          </span>
          <h1>Your Library</h1>
          <p>Everything you have saved, liked, and listened to — in one place.</p>
        </div>
        <div className="library-hero__stat">
          <strong>{counts.liked + counts.albums + counts.artists + counts.recent}</strong>
          <span>items saved</span>
        </div>
      </motion.header>

      <div className="library-tabs" role="tablist" aria-label="Library sections">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`library-tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => changeTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className="library-tab__count">{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          className="library-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {activeTab === "liked" && (
            <>
              <SectionHead
                eyebrow={<span className="eyebrow-icon"><Heart size={18} /></span>}
                title="Liked Songs"
                subtitle="Tracks you have hearted, ready to play in one tap."
              >
                {likedSongs.length > 0 && (
                  <button
                    type="button"
                    className="btn-vyra btn-vyra--sm library-play-all"
                    onClick={() => player.playTracks(likedSongs, 0)}
                  >
                    <span className="btn-vyra__icon">
                      <Play size={14} fill="currentColor" />
                    </span>
                    Play all
                  </button>
                )}
              </SectionHead>
              {likedSongs.length === 0 ? (
                <LibraryEmpty icon={Heart} title="No liked songs yet">
                  Tap the heart on any track and it will show up here.
                </LibraryEmpty>
              ) : (
                <div className="library-rows">
                  {likedSongs.map((track, index) => (
                    <LibraryTrackRow
                      key={`${sourceOf(track)}-${track.id}`}
                      track={track}
                      index={index}
                      onPlay={playOne}
                      currentId={player.currentId}
                      playing={player.playing}
                      onRemove={player.toggleLike}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "albums" && (
            <>
              <SectionHead
                eyebrow={<span className="eyebrow-icon"><Disc3 size={18} /></span>}
                title="Saved Albums"
                subtitle="Collections you want to come back to."
              />
              {albums.length === 0 ? (
                <LibraryEmpty icon={Disc3} title="No saved albums yet">
                  Save an album from any release page and it will be kept here.
                </LibraryEmpty>
              ) : (
                <div className="library-cards">
                  {albums.map((album) => (
                    <SavedCard
                      key={`${sourceOf(album)}-${album.id}`}
                      item={album}
                      type="album"
                      onToggle={toggleSavedAlbum}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "artists" && (
            <>
              <SectionHead
                eyebrow={<span className="eyebrow-icon"><Users size={18} /></span>}
                title="Saved Artists"
                subtitle="Follow the voices that keep showing up in your rotation."
              />
              {artists.length === 0 ? (
                <LibraryEmpty icon={Users} title="No saved artists yet">
                  Save an artist from their page to follow their new releases here.
                </LibraryEmpty>
              ) : (
                <div className="library-cards">
                  {artists.map((artist) => (
                    <SavedCard
                      key={`${sourceOf(artist)}-${artist.id}`}
                      item={artist}
                      type="artist"
                      onToggle={toggleSavedArtist}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "recent" && (
            <>
              <SectionHead
                eyebrow={<span className="eyebrow-icon"><History size={18} /></span>}
                title="Recently Played"
                subtitle="Your listening history on this device, newest first."
              />
              {recent.length === 0 ? (
                <LibraryEmpty icon={History} title="Nothing played yet">
                  Start a song and it will appear here with its source.
                </LibraryEmpty>
              ) : (
                <div className="library-rows">
                  {recent.map((track, index) => (
                    <LibraryTrackRow
                      key={`${sourceOf(track)}-${track.id}-${index}`}
                      track={track}
                      index={index}
                      onPlay={playOne}
                      currentId={player.currentId}
                      playing={player.playing}
                      showSource
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default LibraryPage;
