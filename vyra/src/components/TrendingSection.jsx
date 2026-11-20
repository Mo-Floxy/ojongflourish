import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Play, ArrowRight, Sparkles } from "lucide-react";
import SectionHead from "./SectionHead";
import TrackCard from "./TrackCard";
import ArtistCard from "./ArtistCard";
import PlaylistCard from "./PlaylistCard";
import Equalizer from "./Equalizer";
import { TRACKS, FEATURED, PLAYLISTS, genreLabel } from "../data/music";

const TABS = [
  { id: "tracks", label: "Top tracks" },
  { id: "artists", label: "Top mixes" },
  { id: "playlists", label: "Top playlists" },
];

export default function TrendingSection({
  activeGenre,
  onPlay,
  currentId,
  playing,
  onStartMixing,
}) {
  const [tab, setTab] = useState("tracks");

  const filtered = activeGenre
    ? TRACKS.filter((t) => t.genre === genreLabel(activeGenre))
    : TRACKS;
  const visibleTracks = filtered.slice(0, 5);

  const trackActive = (id) => currentId === id;

  return (
    <section className="section" id="trending">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon">
            <Flame size={19} />
          </span>
        }
        title="Trending now"
        subtitle={activeGenre ? `Filtered to ${genreLabel(activeGenre)} — tap a card to play.` : "What the world has on repeat right now."}
      >
        <div className="tabs" role="tablist" aria-label="Trending views">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`tabs__btn ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {tab === t.id && (
                <motion.span
                  className="tabs__pill"
                  layoutId="trending-tab"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </SectionHead>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {tab === "tracks" && (
            <>
              {visibleTracks.length === 0 ? (
                <div className="empty-state">No tracks in this genre yet. Try another vibe.</div>
              ) : (
                <div className={`track-grid ${activeGenre ? "track-grid--filtered" : ""}`}>
                  {visibleTracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      onPlay={onPlay}
                      active={trackActive(track.id)}
                      playing={playing}
                    />
                  ))}
                </div>
              )}

              <motion.div className="promo" whileHover={{ y: -4 }}>
                <div className="promo__copy">
                  <span className="promo__kicker">
                    <Sparkles size={14} /> VYRA Studio
                  </span>
                  <h3>Create your perfect playlist</h3>
                  <p>Mix. Match. Vibe. Build a set that sounds exactly like you.</p>
                  <button type="button" className="btn-vyra btn-vyra--sm" onClick={onStartMixing}>
                    Get started
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="promo__art" aria-hidden="true">
                  <span className="promo__halo" />
                  <Equalizer bars={18} animated variant={2} barWidth={4} className="promo__eq" />
                  <img src="/images/covers/playlist-studio.jpg" alt="" loading="lazy" />
                  <span className="promo__disc">
                    <span />
                  </span>
                  <span className="promo__note">
                    <Play size={13} fill="currentColor" />
                    24 tracks
                  </span>
                </div>
              </motion.div>
            </>
          )}

          {tab === "artists" && (
            <div className="artist-grid">
              {FEATURED.map((mix) => (
                <ArtistCard
                  key={mix.id}
                  artist={mix}
                  onPlay={onPlay}
                  active={currentId === artist.trackId}
                  playing={playing}
                />
              ))}
            </div>
          )}

          {tab === "playlists" && (
            <div className="playlist-grid playlist-grid--four">
              {PLAYLISTS.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onPlay={onPlay}
                  active={currentId === playlist.trackId}
                  playing={playing}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
