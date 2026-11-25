import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import SectionHead from "./SectionHead";
import { CHARTS, formatTime } from "../data/music";

export default function TopCharts({ tracks, onPlay, currentId, playing, liked, onToggleLike }) {
  const source = tracks?.length ? tracks : CHARTS;
  const chartTracks = source.map((track, index) => ({
    ...track,
    id: String(track.id),
    rank: index + 1,
    plays: Number(track.playCount ?? track.plays) || 0,
    change: Number(track.change) || 0,
    cover: track.cover || "",
    album: track.album || track.artist,
    duration: Number(track.duration) || 0,
    genre: track.genre || "Popular",
  }));
  const top = chartTracks[0];

  return (
    <section className="section" id="charts">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon eyebrow-icon--blue">
            <TrendingUp size={19} />
          </span>
        }
        title="Top charts"
        subtitle="Audius' real weekly trending order — no invented chart positions."
      />

      <div className="charts-layout">
        <div className="chart-panel">
          <div className="chart-panel__head">
            <span>#</span>
            <span>Track</span>
            <span className="chart-panel__plays-label">Plays</span>
            <span className="chart-panel__dur-label">Time</span>
            <span />
          </div>

          {chartTracks.map((track, i) => {
            const active = currentId === track.id;
            const isLiked = liked?.has?.(track.id);
            return (
              <motion.div
                key={`${track.source || "local"}-${track.id}`}
                className={`chart-row ${active ? "is-active" : ""}`}
                onClick={() => onPlay(track)}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <span className={`chart-row__rank ${track.rank <= 3 ? "is-top" : ""}`}>
                  {String(track.rank).padStart(2, "0")}
                </span>
                <div className="chart-row__track">
                  <div className="chart-row__art">
                    <img src={track.cover} alt="" loading="lazy" />
                    <span className="chart-row__play">
                      {active && playing ? (
                        <Pause size={12} fill="currentColor" />
                      ) : (
                        <Play size={12} fill="currentColor" />
                      )}
                    </span>
                  </div>
                  <div className="chart-row__meta">
                    <h4>{track.title}</h4>
                    <p>
                      {track.artist} · {track.album}
                    </p>
                  </div>
                </div>
                <span className={`chart-row__trend ${track.change < 0 ? "is-down" : track.change === 0 ? "is-flat" : ""}`}>
                  {track.change < 0 ? (
                    <TrendingDown size={13} />
                  ) : track.change === 0 ? (
                    <Minus size={13} />
                  ) : (
                    <TrendingUp size={13} />
                  )}
                  {track.change === 0 ? "0" : Math.abs(track.change)}
                </span>
                <span className="chart-row__plays">
                  {track.plays >= 1_000_000
                    ? `${(track.plays / 1_000_000).toFixed(1)}M`
                    : track.plays.toLocaleString()}
                </span>
                <span className="chart-row__dur">{formatTime(track.duration)}</span>
                <button
                  type="button"
                  className={`chart-row__like ${isLiked ? "is-liked" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleLike(track);
                  }}
                  aria-label={isLiked ? "Remove from liked songs" : "Like song"}
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {top && (
          <motion.aside
            className="spotlight"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img className="spotlight__bg" src={top.cover} alt="" aria-hidden="true" />
            <span className="spotlight__scrim" aria-hidden="true" />
            <div className="spotlight__head">
              <span className="spotlight__rank">
                <ArrowUpRight size={13} /> #1 this week
              </span>
              <span className="spotlight__badge">VYRA Charts</span>
            </div>
            <div className="spotlight__art">
              <img src={top.cover} alt={`${top.title} cover`} />
              <span className="spotlight__pulse" aria-hidden="true" />
            </div>
            <h3 className="spotlight__title">{top.title}</h3>
            <p className="spotlight__artist">
              {top.artist} · {top.album}
            </p>
            <div className="spotlight__meta">
              <span>{top.plays.toLocaleString()} plays</span>
              <span className="spotlight__dot" />
              <span>{top.genre}</span>
              <span className="spotlight__dot" />
              <span>{formatTime(top.duration)}</span>
            </div>
            <button type="button" className="btn-vyra spotlight__cta" onClick={() => onPlay(top)}>
              <span className="btn-vyra__icon">
                {currentId === top.id && playing ? (
                  <Pause size={14} fill="currentColor" />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
              </span>
              {currentId === top.id && playing ? "Pause" : "Play now"}
            </button>
          </motion.aside>
        )}
      </div>
    </section>
  );
}
