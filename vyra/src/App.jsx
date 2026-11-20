import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import GenreSection from "./components/GenreSection";
import TrendingSection from "./components/TrendingSection";
import MadeForYou from "./components/MadeForYou";
import TopCharts from "./components/TopCharts";
import Player from "./components/Player";
import SpotifySection from "./components/SpotifySection";
import SpotifyPlayer from "./components/SpotifyPlayer";
import Footer from "./components/Footer";
import useSpotify from "./hooks/useSpotify";
import { TRACKS } from "./data/music";

const STORAGE_KEY = "vyra:listener:v1";
const DEFAULT_LIKED = ["t1", "t5"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const readSavedState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function App() {
  const saved = useMemo(readSavedState, []);
  const initialTrack = TRACKS.find((t) => t.id === saved?.currentId) ?? TRACKS[0];

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [activeGenre, setActiveGenre] = useState(null);

  const [queue] = useState(TRACKS);
  const [currentId, setCurrentId] = useState(initialTrack.id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(() =>
    Number.isFinite(saved?.progress) ? clamp(saved.progress, 0, initialTrack.duration) : 0
  );
  const [duration, setDuration] = useState(initialTrack.duration);
  const [audioError, setAudioError] = useState("");
  const [liked, setLiked] = useState(() =>
    new Set(Array.isArray(saved?.liked) ? saved.liked : DEFAULT_LIKED)
  );
  const [shuffle, setShuffle] = useState(() => Boolean(saved?.shuffle));
  const [repeat, setRepeat] = useState(() => Boolean(saved?.repeat));
  const [volume, setVolume] = useState(() =>
    Number.isFinite(saved?.volume) ? clamp(saved.volume, 0, 1) : 0.72
  );
  const [muted, setMuted] = useState(() => Boolean(saved?.muted));
  const [queueOpen, setQueueOpen] = useState(false);
  const spotify = useSpotify();
  const [spotifyActive, setSpotifyActive] = useState(false);

  const currentTrack = useMemo(
    () => queue.find((t) => t.id === currentId) ?? queue[0],
    [queue, currentId]
  );

  const audioRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const pendingPlayRef = useRef(false);
  const attemptPlayRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const playingRef = useRef(playing);
  const progressRef = useRef(progress);
  const currentTrackRef = useRef(currentTrack);
  const currentIdRef = useRef(currentId);
  const repeatRef = useRef(repeat);
  playingRef.current = playing;
  progressRef.current = progress;
  currentTrackRef.current = currentTrack;
  currentIdRef.current = currentId;
  repeatRef.current = repeat;

  useEffect(() => {
    if (spotify.track) setSpotifyActive(true);
  }, [spotify.track]);

  useEffect(() => {
    if (!spotifyActive) return;
    audioRef.current?.pause();
    setPlaying(false);
  }, [spotifyActive]);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = muted ? 0 : volume;

    const attemptPlay = () => {
      const pending = audio.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch((error) => {
          if (error?.name !== "AbortError") {
            setAudioError("Playback was blocked. Press play again.");
            setPlaying(false);
          }
        });
      }
    };
    attemptPlayRef.current = attemptPlay;

    audio.addEventListener("timeupdate", () => setProgress(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
      if (pendingSeekRef.current !== null) {
        const target = clamp(pendingSeekRef.current, 0, audio.duration || pendingSeekRef.current);
        if (target > 0) audio.currentTime = target;
        pendingSeekRef.current = null;
      }
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        attemptPlay();
      }
    });
    audio.addEventListener("ended", () => endedHandlerRef.current?.());
    audio.addEventListener("error", () => {
      setAudioError("That track could not be loaded. Try another song.");
      setPlaying(false);
    });
    audioRef.current = audio;
    return audio;
  }, [muted, volume]);

  const startAudio = useCallback(
    (track, position = 0) => {
      const audio = ensureAudio();
      setAudioError("");

      if (audio.dataset.trackId !== track.id) {
        audio.dataset.trackId = track.id;
        audio.src = track.src;
        setDuration(track.duration);
        pendingSeekRef.current = position;
        pendingPlayRef.current = true;
        audio.load();
      } else if (audio.readyState >= 1) {
        if (position > 0) audio.currentTime = clamp(position, 0, audio.duration || position);
        attemptPlayRef.current?.();
      } else {
        pendingSeekRef.current = position;
        pendingPlayRef.current = true;
      }
    },
    [ensureAudio]
  );

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      startAudio(currentTrackRef.current, progressRef.current);
    }
  }, [startAudio]);

  const handleSeek = useCallback((value) => {
    setProgress(value);
    const audio = audioRef.current;
    if (!audio || audio.dataset.trackId !== currentIdRef.current) return;
    if (audio.readyState >= 1) audio.currentTime = clamp(value, 0, audio.duration || value);
    else pendingSeekRef.current = value;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
    []
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentId,
          progress,
          volume,
          muted,
          shuffle,
          repeat,
          liked: [...liked],
        })
      );
    } catch {
      // Storage can be unavailable in private mode; playback still works in memory.
    }
  }, [currentId, progress, volume, muted, shuffle, repeat, liked]);

  const playTrack = useCallback(
    (id) => {
      if (spotifyActive) {
        spotify.pause();
        setSpotifyActive(false);
      }
      if (id === currentId) {
        togglePlay();
        return;
      }
      const track = queue.find((t) => t.id === id);
      setCurrentId(id);
      setProgress(0);
      setPlaying(true);
      if (track) startAudio(track, 0);
    },
    [currentId, queue, togglePlay, startAudio, spotifyActive, spotify.pause]
  );

  const playSpotifyTrack = useCallback(
    async (item) => {
      const started = await spotify.playTracks([item.uri]);
      if (started) {
        audioRef.current?.pause();
        setPlaying(false);
        setSpotifyActive(true);
      }
    },
    [spotify.playTracks]
  );

  const nextTrack = useCallback(() => {
    const index = queue.findIndex((t) => t.id === currentId);
    let next;
    if (shuffle && queue.length > 1) {
      do {
        next = queue[Math.floor(Math.random() * queue.length)];
      } while (next.id === currentId);
    } else {
      next = queue[(index + 1) % queue.length];
    }
    setCurrentId(next.id);
    setProgress(0);
    setPlaying(true);
    startAudio(next, 0);
  }, [queue, currentId, shuffle, startAudio]);

  const prevTrack = useCallback(() => {
    if (progress > 5) {
      handleSeek(0);
      return;
    }
    const index = queue.findIndex((t) => t.id === currentId);
    const prev = queue[(index - 1 + queue.length) % queue.length];
    setCurrentId(prev.id);
    setProgress(0);
    setPlaying(true);
    startAudio(prev, 0);
  }, [queue, currentId, progress, handleSeek, startAudio]);

  endedHandlerRef.current = () => {
    if (repeatRef.current) {
      handleSeek(0);
      startAudio(currentTrackRef.current, 0);
    } else {
      nextTrack();
    }
  };

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeVolume = (value) => {
    setVolume(value);
    setMuted(value === 0);
  };

  const selectGenre = (id) => {
    setActiveGenre(id);
    if (id) scrollToId("trending");
  };

  const handleNavigate = (id) => {
    setActiveNav(id);
    setMenuOpen(false);
    if (id === "search") {
      scrollToId("top");
      window.setTimeout(() => document.getElementById("vyra-search")?.focus(), 350);
      return;
    }
    const targets = {
      home: "top",
      library: "made-for-you",
      playlists: "made-for-you",
      artists: "trending",
      albums: "genres",
      liked: "charts",
    };
    scrollToId(targets[id] ?? "top");
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (spotifyActive) spotify.toggle();
        else togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, spotifyActive, spotify.toggle]);

  return (
    <div className="app">
      <div className="bg-fx" aria-hidden="true">
        <span className="bg-fx__blob bg-fx__blob--violet" />
        <span className="bg-fx__blob bg-fx__blob--blue" />
        <span className="bg-fx__grain" />
      </div>

      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        likedCount={liked.size}
        onUpgrade={() => scrollToId("spotify")}
      />

      <main className="main">
        <TopBar
          onMenu={() => setMenuOpen(true)}
          onPlayTrack={playTrack}
          onGenreSelect={selectGenre}
        />

        <div className="page">
          <Hero
            onStart={() => playTrack("t1")}
            onExplore={() => scrollToId("genres")}
            nowPlaying={currentTrack}
          />

          <GenreSection
            activeGenre={activeGenre}
            onSelect={selectGenre}
            onSeeAll={() => scrollToId("trending")}
          />

          <TrendingSection
            activeGenre={activeGenre}
            onPlay={playTrack}
            currentId={currentId}
            playing={playing}
            onStartMixing={() => scrollToId("made-for-you")}
          />

          <SpotifySection spotify={spotify} onPlayTrack={playSpotifyTrack} />

          <MadeForYou onPlay={playTrack} currentId={currentId} playing={playing} onSeeAll={() => scrollToId("charts")} />

          <TopCharts
            onPlay={playTrack}
            currentId={currentId}
            playing={playing}
            liked={liked}
            onToggleLike={toggleLike}
          />

          <Footer />
        </div>
      </main>

      {spotifyActive && spotify.track ? (
        <SpotifyPlayer
          spotify={spotify}
          onClose={() => {
            spotify.pause();
            setSpotifyActive(false);
          }}
        />
      ) : (
        <Player
          track={currentTrack}
          queue={queue}
          playing={playing}
          progress={progress}
          duration={duration}
          error={audioError}
          onToggle={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          onSeek={handleSeek}
          volume={volume}
          muted={muted}
          onVolume={changeVolume}
          onToggleMute={() => setMuted((m) => !m)}
          shuffle={shuffle}
          repeat={repeat}
          onShuffle={() => setShuffle((s) => !s)}
          onRepeat={() => setRepeat((r) => !r)}
          liked={liked}
          onToggleLike={toggleLike}
          queueOpen={queueOpen}
          onToggleQueue={() => setQueueOpen((q) => !q)}
          onCloseQueue={() => setQueueOpen(false)}
          onPlayTrack={playTrack}
        />
      )}
    </div>
  );
}
