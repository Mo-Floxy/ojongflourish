import { useEffect, useMemo, useState } from "react";
import { Flame, Sparkles, History, Heart, Play } from "lucide-react";
import SectionHead from "./SectionHead";
import AudiusImage from "./AudiusImage";
import Equalizer from "./Equalizer";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { TRACKS, formatTime } from "../data/music";
import {
  getRecommendedTracks,
  getTrendingTracks,
  isAudiusConfigured,
} from "../services/audius";

const localTracks = TRACKS.map((track) => ({ ...track, source: "local", src: track.src }));

function TrackRow({ track, index, onPlay, currentId, playing, onOpenArtist }) {
  const active = currentId === String(track.id);
  return (
    <div className={`home-row ${active ? "is-active" : ""}`}>
      <span className="home-row__index">{String(index + 1).padStart(2, "0")}</span>
      <button type="button" className="home-row__art" onClick={() => onPlay(track)} aria-label={`Play ${track.title}`}>
        <AudiusImage artwork={track.artwork} alt="" className="home-row__img" fallback={track.cover} />
        <span className={`home-row__eq ${active && playing ? "is-on" : ""}`}>
          <Equalizer bars={3} animated={active && playing} barWidth={2} />
        </span>
      </button>
      <div className="home-row__meta">
        <button type="button" className="home-row__title" onClick={() => onPlay(track)}>
          {track.title}
        </button>
        {onOpenArtist && track.source === "audius" && track.artistId ? (
          <button type="button" className="home-row__artist" onClick={() => onOpenArtist({ id: track.artistId, name: track.artist, source: "audius" })}>
            {track.artist}
          </button>
        ) : (
          <span className="home-row__artist">{track.artist}</span>
        )}
      </div>
      <span className="home-row__album">{track.album || (track.source === "audius" ? "Audius" : "VYRA")}</span>
      <span className="home-row__duration">{formatTime(track.duration)}</span>
      <button type="button" className="home-row__play" onClick={() => onPlay(track)} aria-label={`Play ${track.title}`}>
        <Play size={14} fill="currentColor" />
      </button>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="home-rows">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="home-row home-row--skeleton">
          <span className="home-row__index">{String(i + 1).padStart(2, "0")}</span>
          <span className="home-row__art home-row__art--skeleton" />
          <span className="home-row__meta">
            <span className="home-row__title" />
            <span className="home-row__artist" />
          </span>
          <span className="home-row__duration" />
        </div>
      ))}
    </div>
  );
}

function AudiusRail({ title, subtitle, eyebrow, fetcher, onPlayTrack, currentId, playing, onOpenArtist }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!isAudiusConfigured()) {
      setLoading(false);
      setError("Add VITE_AUDIUS_API_KEY to vyra/.env.local to load this section.");
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetcher({ signal: controller.signal })
      .then((items) => setTracks(items.slice(0, 6)))
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Could not load tracks.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fetcher, nonce]);

  return (
    <section className="section" id={title.toLowerCase().replace(/[^a-z]+/g, "-")}>
      <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {loading ? (
        <LoadingRows />
      ) : error ? (
        <div className="home-extra-empty">
          <p>{error}</p>
          <button type="button" className="btn-ghost btn-ghost--sm" onClick={() => setNonce((n) => n + 1)}>
            Retry
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="home-extra-empty">No tracks are available for this section yet.</div>
      ) : (
        <div className="home-rows">
          {tracks.map((track, index) => (
            <TrackRow
              key={`${track.source}-${track.id}-${index}`}
              track={track}
              index={index}
              onPlay={onPlayTrack}
              currentId={currentId}
              playing={playing}
              onOpenArtist={onOpenArtist}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function DynamicCharts(props) {
  return (
    <AudiusRail
      {...props}
      eyebrow={<span className="eyebrow-icon"><Flame size={18} /></span>}
      title="Top Charts"
      subtitle="Ranked by Audius trending order — no invented chart positions."
      fetcher={(options) => getTrendingTracks({ time: "week", limit: 10, ...options })}
    />
  );
}

export function RecommendedForYou(props) {
  return (
    <AudiusRail
      {...props}
      eyebrow={<span className="eyebrow-icon"><Sparkles size={18} /></span>}
      title="Recommended for You"
      subtitle="A real recommendation feed from Audius."
      fetcher={(options) => getRecommendedTracks({ limit: 10, ...options })}
    />
  );
}

export function RecentlyPlayedStrip({ onPlayTrack, currentId, playing }) {
  const { recentTracks } = useLibrary();
  const tracks = useMemo(
    () => (recentTracks.length ? recentTracks : localTracks.slice(0, 5)),
    [recentTracks]
  );
  return (
    <section className="section" id="recently-played">
      <SectionHead
        eyebrow={<span className="eyebrow-icon"><History size={18} /></span>}
        title="Recently Played"
        subtitle={recentTracks.length ? "Tracks you listened to on this device." : "Start listening and your history will appear here."}
      />
      <div className="home-rows">
        {tracks.slice(0, 6).map((track, index) => (
          <TrackRow
            key={`${track.source}-${track.id}-${index}`}
            track={track}
            index={index}
            onPlay={onPlayTrack}
            currentId={currentId}
            playing={playing}
          />
        ))}
      </div>
    </section>
  );
}

export function FavouriteSongsStrip() {
  const { liked, likedTracks, queue, playTracks, currentId, playing } = usePlayer();
  const tracks = useMemo(() => {
    const pool = [...queue, ...localTracks, ...Object.values(likedTracks)];
    const seen = new Set();
    return [...liked]
      .map((id) => pool.find((track) => String(track.id) === String(id)))
      .filter((track) => {
        if (!track || seen.has(`${track.source}-${track.id}`)) return false;
        seen.add(`${track.source}-${track.id}`);
        return true;
      });
  }, [liked, likedTracks, queue]);

  return (
    <section className="section" id="favourite-songs">
      <SectionHead
        eyebrow={<span className="eyebrow-icon"><Heart size={18} /></span>}
        title="Your Favourite Songs"
        subtitle="Liked tracks saved on this device."
      >
        {tracks.length > 0 && (
          <button type="button" className="btn-ghost btn-ghost--sm" onClick={() => playTracks(tracks, 0)}>
            Play all
          </button>
        )}
      </SectionHead>
      {tracks.length === 0 ? (
        <div className="home-extra-empty">Like a song and it will appear here.</div>
      ) : (
        <div className="home-rows">
          {tracks.slice(0, 6).map((track, index) => (
            <TrackRow
              key={`${track.source}-${track.id}-${index}`}
              track={track}
              index={index}
              onPlay={(item) => playTracks(tracks, tracks.findIndex((t) => t.id === item.id))}
              currentId={currentId}
              playing={playing}
            />
          ))}
        </div>
      )}
    </section>
  );
}
