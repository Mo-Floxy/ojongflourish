import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ListMusic,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash,
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

function PlaylistEmpty({ icon: Icon, title, children }) {
  return (
    <motion.div
      className="playlist-empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="playlist-empty__icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </motion.div>
  );
}

function PlaylistMosaic({ tracks }) {
  const covers = (tracks || []).filter((track) => track?.id).slice(0, 4);

  if (!covers.length) {
    return (
      <div className="playlist-mosaic playlist-mosaic--empty">
        <ListMusic size={28} />
        <span>Empty playlist</span>
      </div>
    );
  }

  return (
    <div className={`playlist-mosaic playlist-mosaic--${covers.length}`}>
      {covers.map((track, index) => (
        <div className="playlist-mosaic__tile" key={`${sourceOf(track)}-${track.id}-${index}`}>
          <TrackArt track={track} className="playlist-mosaic__img" />
        </div>
      ))}
    </div>
  );
}

function PlaylistTrackRow({ track, index, onPlay, onRemove, currentId, playing }) {
  const active = String(currentId) === String(track.id);
  const source = sourceOf(track);

  return (
    <motion.div
      className={`playlist-row ${active ? "is-active" : ""}`}
      onClick={() => onPlay(track)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.25) }}
    >
      <span className="playlist-row__index">
        {active && playing ? (
          <Equalizer bars={3} animated barWidth={2} />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>

      <div className="playlist-row__art">
        <TrackArt track={track} className="playlist-row__img" />
        <button
          type="button"
          className="playlist-row__play"
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

      <div className="playlist-row__meta">
        <h4 title={track.title}>{track.title}</h4>
        <p>{track.artist}{track.album ? ` · ${track.album}` : ""}</p>
      </div>

      <span className="playlist-row__album">
        {track.album || (source === "audius" ? "Audius" : "VYRA")}
      </span>
      <span className="playlist-row__time">{formatTime(Number(track.duration) || 0)}</span>

      <button
        type="button"
        className="playlist-row__remove"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(track);
        }}
        aria-label={`Remove ${track.title} from playlist`}
        title="Remove from playlist"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

function AddResultRow({ track, index, added, onAdd }) {
  const source = sourceOf(track);

  return (
    <motion.div
      className={`playlist-add__row ${added ? "is-added" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: Math.min(index * 0.015, 0.2) }}
    >
      <div className="playlist-add__art">
        <TrackArt track={track} className="playlist-add__img" />
      </div>
      <div className="playlist-add__meta">
        <h4 title={track.title}>{track.title}</h4>
        <p>{track.artist}{track.album ? ` · ${track.album}` : ""}</p>
      </div>
      <span className={`playlist-source playlist-source--${source}`}>
        {source === "audius" ? "Audius" : "VYRA local"}
      </span>
      <button
        type="button"
        className="playlist-add__button"
        disabled={added}
        onClick={() => onAdd(track)}
        aria-label={added ? `${track.title} already in playlist` : `Add ${track.title} to playlist`}
      >
        {added ? <Check size={14} /> : <Plus size={14} />}
        {added ? "Added" : "Add"}
      </button>
    </motion.div>
  );
}

export function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const player = usePlayer();
  const {
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylist,
  } = useLibrary();

  const playlist = id ? getPlaylist(id) : null;

  const [renamingId, setRenamingId] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [trackQuery, setTrackQuery] = useState("");

  useEffect(() => {
    setNameDraft(playlist?.name || "");
  }, [playlist?.id, playlist?.name]);

  useEffect(() => {
    setRenamingId("");
    setRenameDraft("");
    setTrackQuery("");
  }, [id]);

  const candidateTracks = useMemo(() => {
    const byKey = new Map();
    const add = (item) => {
      const normalized = normalizeTrack(item);
      if (!normalized) return;
      const key = `${normalized.source}:${normalized.id}`;
      const existing = byKey.get(key);
      byKey.set(key, existing ? { ...existing, ...normalized } : normalized);
    };
    LOCAL_TRACKS.forEach(add);
    (player.queue || []).forEach(add);
    return Array.from(byKey.values());
  }, [player.queue]);

  const filteredCandidates = useMemo(() => {
    const query = trackQuery.trim().toLowerCase();
    if (!query) return candidateTracks;
    return candidateTracks.filter((track) =>
      [track.title, track.artist, track.album, track.genre]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [candidateTracks, trackQuery]);

  const normalizedPlaylistTracks = useMemo(
    () => (playlist?.tracks || []).map(normalizeTrack).filter(Boolean),
    [playlist?.tracks]
  );

  const playlistTrackIds = useMemo(
    () => new Set((playlist?.tracks || []).map((track) => String(track.id))),
    [playlist?.tracks]
  );

  const commitListRename = useCallback(
    (playlistId) => {
      const clean = renameDraft.trim();
      if (clean) renamePlaylist(playlistId, clean);
      setRenamingId("");
    },
    [renameDraft, renamePlaylist]
  );

  const commitDetailRename = useCallback(() => {
    if (!playlist) return;
    const clean = nameDraft.trim();
    if (clean && clean !== playlist.name) renamePlaylist(playlist.id, clean);
    else if (!clean) setNameDraft(playlist.name);
  }, [nameDraft, playlist, renamePlaylist]);

  const handleCreate = () => {
    const created = createPlaylist("New playlist", []);
    if (created?.id) navigate(`/playlists/${created.id}`);
  };

  const handleDelete = (playlistId) => {
    deletePlaylist(playlistId);
    if (playlistId === id) navigate("/playlists");
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

  const playWholePlaylist = () => {
    if (normalizedPlaylistTracks.length) player.playTracks(normalizedPlaylistTracks, 0);
  };

  if (!id) {
    return (
      <div className="playlist-page">
        <motion.header
          className="playlist-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="playlist-hero__copy">
            <span className="playlist-hero__eyebrow">
              <ListMusic size={14} /> Your mixes
            </span>
            <h1>Playlists</h1>
            <p>Build the queue you want, then keep it in your library.</p>
          </div>
          <button type="button" className="btn-vyra btn-vyra--sm" onClick={handleCreate}>
            <span className="btn-vyra__icon">
              <Plus size={15} />
            </span>
            New playlist
          </button>
        </motion.header>

        <SectionHead
          eyebrow={<span className="eyebrow-icon"><ListMusic size={18} /></span>}
          title="All playlists"
          subtitle={`${playlists.length} playlist${playlists.length === 1 ? "" : "s"} saved on this device.`}
        />

        {playlists.length === 0 ? (
          <PlaylistEmpty icon={ListMusic} title="No playlists yet">
            Create a new playlist to start collecting tracks.
          </PlaylistEmpty>
        ) : (
          <div className="playlist-grid">
            {playlists.map((item, index) => (
              <motion.article
                key={item.id}
                className="playlist-item"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.04, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="playlist-item__cover">
                  <PlaylistMosaic tracks={item.tracks} />
                </div>
                <div className="playlist-item__body">
                  {renamingId === item.id ? (
                    <input
                      autoFocus
                      className="playlist-item__rename"
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      onBlur={() => commitListRename(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setRenamingId("");
                        }
                      }}
                      aria-label={`Rename ${item.name}`}
                    />
                  ) : (
                    <h3 className="playlist-item__title" title={item.name}>
                      {item.name}
                    </h3>
                  )}
                  <p className="playlist-item__meta">
                    {(item.tracks || []).length} track
                    {(item.tracks || []).length === 1 ? "" : "s"}
                  </p>
                  <div className="playlist-item__actions">
                    <Link className="playlist-action playlist-action--primary" to={`/playlists/${item.id}`}>
                      <Play size={13} fill="currentColor" />
                      Open
                    </Link>
                    <button
                      type="button"
                      className="playlist-action"
                      onClick={() => {
                        setRenamingId(item.id);
                        setRenameDraft(item.name);
                      }}
                    >
                      <Pencil size={13} />
                      Rename
                    </button>
                    <button
                      type="button"
                      className="playlist-action playlist-action--danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="playlist-page playlist-page--detail">
        <Link className="playlist-back" to="/playlists">
          <ArrowLeft size={14} /> All playlists
        </Link>
        <PlaylistEmpty icon={ListMusic} title="Playlist not found">
          This playlist may have been removed from your library.
        </PlaylistEmpty>
      </div>
    );
  }

  return (
    <div className="playlist-page playlist-page--detail">
      <motion.header
        className="playlist-detail"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="playlist-detail__cover">
          <PlaylistMosaic tracks={playlist.tracks} />
        </div>
        <div className="playlist-detail__content">
          <Link className="playlist-back" to="/playlists">
            <ArrowLeft size={14} /> All playlists
          </Link>
          <span className="playlist-detail__eyebrow">Your playlist</span>
          <input
            className="playlist-detail__name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={commitDetailRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setNameDraft(playlist.name);
              }
            }}
            aria-label="Playlist name"
          />
          <p className="playlist-detail__meta">
            {normalizedPlaylistTracks.length} track
            {normalizedPlaylistTracks.length === 1 ? "" : "s"} · Saved with your library
          </p>
          <div className="playlist-detail__actions">
            <button
              type="button"
              className="btn-vyra btn-vyra--sm"
              disabled={!normalizedPlaylistTracks.length}
              onClick={playWholePlaylist}
            >
              <span className="btn-vyra__icon">
                <Play size={14} fill="currentColor" />
              </span>
              Play playlist
            </button>
            <span className="playlist-detail__hint">Changes save automatically</span>
          </div>
        </div>
      </motion.header>

      <section className="playlist-section">
        <SectionHead
          eyebrow={<span className="eyebrow-icon"><ListMusic size={18} /></span>}
          title="Tracks"
          subtitle="Remove anything that no longer belongs in the mix."
        />
        {normalizedPlaylistTracks.length === 0 ? (
          <PlaylistEmpty icon={ListMusic} title="This playlist is empty">
            Add tracks below to start building the mix.
          </PlaylistEmpty>
        ) : (
          <div className="playlist-rows">
            {normalizedPlaylistTracks.map((track, index) => (
              <PlaylistTrackRow
                key={`${sourceOf(track)}-${track.id}`}
                track={track}
                index={index}
                onPlay={playOne}
                onRemove={(item) => removeTrackFromPlaylist(playlist.id, item.id)}
                currentId={player.currentId}
                playing={player.playing}
              />
            ))}
          </div>
        )}
      </section>

      <section className="playlist-section playlist-add">
        <SectionHead
          eyebrow={<span className="eyebrow-icon"><Plus size={18} /></span>}
          title="Add tracks"
          subtitle="Search VYRA local tracks and Audius songs from your current queue."
        >
          <span className="playlist-add__count">{filteredCandidates.length} available</span>
        </SectionHead>

        <label className="playlist-add__search">
          <Search size={17} />
          <input
            value={trackQuery}
            onChange={(event) => setTrackQuery(event.target.value)}
            placeholder="Search by title, artist, album, or genre"
            aria-label="Search tracks to add"
          />
          {trackQuery && (
            <button
              type="button"
              onClick={() => setTrackQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <AnimatePresence mode="wait" initial={false}>
          {filteredCandidates.length === 0 ? (
            <PlaylistEmpty key="no-results" icon={Search} title="No tracks found">
              Try a shorter title, an artist name, or a genre.
            </PlaylistEmpty>
          ) : (
            <motion.div
              key="results"
              className="playlist-add__results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredCandidates.map((track, index) => (
                <AddResultRow
                  key={`${track.source}-${track.id}`}
                  track={track}
                  index={index}
                  added={playlistTrackIds.has(String(track.id))}
                  onAdd={(item) => addTrackToPlaylist(playlist.id, normalizeTrack(item))}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

export default PlaylistPage;
