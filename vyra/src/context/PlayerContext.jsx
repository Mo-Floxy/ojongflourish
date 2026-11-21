import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TRACKS } from "../data/music";
import { resolveAudiusStream } from "../services/audius";
import { useSpotifyContext } from "./SpotifyContext";

const STORAGE_KEY = "vyra:listener:v1";
const DEFAULT_LIKED = ["t1", "t5"];
const PlayerContext = createContext(null);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const localTracks = TRACKS.map((track) => ({
  ...track,
  source: "local",
  sourceId: track.id,
  src: track.src,
}));

const serializeTrack = (track) => {
  if (!track) return null;
  const { raw, ...rest } = track;
  return {
    ...rest,
    src: track.source === "audius" ? "" : track.src,
    artwork: track.artwork || null,
  };
};

const normalizeSavedTrack = (track) => {
  if (!track?.id) return null;
  const source = track.source === "audius" ? "audius" : "local";
  return {
    ...track,
    source,
    sourceId: track.sourceId || track.id,
    src: source === "audius" ? "" : track.src,
  };
};

const sameTrack = (a, b) =>
  Boolean(a && b && String(a.id) === String(b.id) && (a.source || "local") === (b.source || "local"));

function readSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function initialState() {
  const saved = readSavedState();
  const savedQueue = Array.isArray(saved?.queue)
    ? saved.queue.map(normalizeSavedTrack).filter(Boolean)
    : [];
  const savedExternal = normalizeSavedTrack(saved?.currentTrack);
  const queue = savedQueue.length ? [...savedQueue] : [...localTracks];

  if (savedExternal?.source === "audius" && !queue.some((t) => sameTrack(t, savedExternal))) {
    queue.unshift(savedExternal);
  }

  const currentTrack =
    queue.find((track) => String(track.id) === String(saved?.currentId)) ||
    localTracks.find((track) => String(track.id) === String(saved?.currentId)) ||
    localTracks[0];

  return {
    saved,
    queue,
    currentTrack,
    liked: new Set(Array.isArray(saved?.liked) ? saved.liked : DEFAULT_LIKED),
    likedTracks: saved?.likedTracks && typeof saved.likedTracks === "object" ? saved.likedTracks : {},
  };
}

export function PlayerProvider({ children }) {
  const spotify = useSpotifyContext();
  const initial = useMemo(initialState, []);

  const [queue, setQueue] = useState(initial.queue);
  const [currentId, setCurrentId] = useState(String(initial.currentTrack.id));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(() => {
    const saved = initial.saved;
    if (!Number.isFinite(saved?.progress)) return 0;
    return clamp(saved.progress, 0, initial.currentTrack.duration || saved.progress);
  });
  const [duration, setDuration] = useState(initial.currentTrack.duration || 0);
  const [audioError, setAudioError] = useState("");
  const [loadingStream, setLoadingStream] = useState(false);
  const [liked, setLiked] = useState(initial.liked);
  const [likedTracks, setLikedTracks] = useState(initial.likedTracks);
  const [shuffle, setShuffle] = useState(() => Boolean(initial.saved?.shuffle));
  const [repeat, setRepeat] = useState(() => Boolean(initial.saved?.repeat));
  const [volume, setVolume] = useState(() =>
    Number.isFinite(initial.saved?.volume) ? clamp(initial.saved.volume, 0, 1) : 0.72
  );
  const [muted, setMuted] = useState(() => Boolean(initial.saved?.muted));
  const [queueOpen, setQueueOpen] = useState(false);
  const [source, setSource] = useState(initial.saved?.source === "audius" ? "audius" : "local");

  const currentTrack = useMemo(
    () =>
      queue.find((track) => String(track.id) === String(currentId)) ||
      localTracks.find((track) => String(track.id) === String(currentId)) ||
      queue[0] ||
      localTracks[0],
    [queue, currentId]
  );

  const audioRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const pendingPlayRef = useRef(false);
  const attemptPlayRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const loadTokenRef = useRef(0);
  const playingRef = useRef(playing);
  const progressRef = useRef(progress);
  const currentTrackRef = useRef(currentTrack);
  const queueRef = useRef(queue);
  const shuffleRef = useRef(shuffle);
  const repeatRef = useRef(repeat);

  playingRef.current = playing;
  progressRef.current = progress;
  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  shuffleRef.current = shuffle;
  repeatRef.current = repeat;

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

    audio.addEventListener("play", () => {
      setPlaying(true);
      setAudioError("");
    });
    audio.addEventListener("playing", () => {
      setPlaying(true);
      setLoadingStream(false);
    });
    audio.addEventListener("pause", () => setPlaying(false));
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
      setLoadingStream(false);
      setPlaying(false);
    });

    audioRef.current = audio;
    return audio;
  }, [muted, volume]);

  const startAudio = useCallback(
    (track, position = 0) => {
      if (!track?.id) return;
      const token = ++loadTokenRef.current;
      const audio = ensureAudio();
      setAudioError("");
      setLoadingStream(track.source === "audius" && !track.src);

      const load = async () => {
        let streamUrl = track.src;
        if (track.source === "audius" && !streamUrl) {
          try {
            streamUrl = await resolveAudiusStream(track);
          } catch (error) {
            if (token !== loadTokenRef.current) return;
            setAudioError(
              error instanceof Error ? error.message : "This Audius track is unavailable."
            );
            setLoadingStream(false);
            setPlaying(false);
            return;
          }
          if (token !== loadTokenRef.current) return;
          setQueue((current) =>
            current.map((item) =>
              sameTrack(item, track) ? { ...item, src: streamUrl } : item
            )
          );
        }
        if (token !== loadTokenRef.current || !streamUrl) return;
        setLoadingStream(false);

        audio.dataset.trackId = String(track.id);
        audio.dataset.source = track.source || "local";
        const absolute = new URL(streamUrl, window.location.href).href;
        if (audio.src !== absolute) {
          audio.src = absolute;
          setDuration(track.duration || 0);
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
      };

      load();
    },
    [ensureAudio]
  );

  const pauseAudio = useCallback(() => {
    loadTokenRef.current += 1;
    audioRef.current?.pause();
    pendingPlayRef.current = false;
    setPlaying(false);
    setLoadingStream(false);
  }, []);

  const findTrack = useCallback(
    (input) => {
      if (input && typeof input === "object" && input.id) return input;
      return (
        queueRef.current.find((track) => String(track.id) === String(input)) ||
        localTracks.find((track) => String(track.id) === String(input)) ||
        null
      );
    },
    []
  );

  const activateLocalSource = useCallback(
    (track) => {
      spotify.pause?.();
      setSource(track.source === "audius" ? "audius" : "local");
    },
    [spotify]
  );

  const playTrack = useCallback(
    (input, options = {}) => {
      const track = findTrack(input);
      if (!track) return;
      activateLocalSource(track);
      setQueue((current) =>
        current.some((item) => sameTrack(item, track)) ? current : [...current, track]
      );
      setCurrentId(String(track.id));
      setProgress(options.position || 0);
      setDuration(track.duration || 0);
      startAudio(track, options.position || 0);
    },
    [findTrack, activateLocalSource, startAudio]
  );

  const playTracks = useCallback(
    (tracks, startIndex = 0) => {
      const normalized = (tracks || [])
        .filter((track) => track?.id)
        .map((track) =>
          track.source === "audius" ? track : { ...track, source: "local", src: track.src }
        );
      if (!normalized.length) return;
      const index = clamp(startIndex, 0, normalized.length - 1);
      spotify.pause?.();
      setQueue(normalized);
      setSource(normalized[index].source === "audius" ? "audius" : "local");
      setCurrentId(String(normalized[index].id));
      setProgress(0);
      setDuration(normalized[index].duration || 0);
      startAudio(normalized[index], 0);
    },
    [spotify, startAudio]
  );

  const enqueueTracks = useCallback((tracks) => {
    const normalized = (tracks || []).filter((track) => track?.id);
    if (!normalized.length) return;
    setQueue((current) => {
      const next = [...current];
      normalized.forEach((track) => {
        if (!next.some((item) => sameTrack(item, track))) next.push(track);
      });
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    startAudio(currentTrackRef.current, progressRef.current);
  }, [startAudio]);

  const handleSeek = useCallback((value) => {
    setProgress(value);
    const audio = audioRef.current;
    if (!audio || audio.dataset.trackId !== String(currentTrackRef.current?.id)) {
      pendingSeekRef.current = value;
      return;
    }
    if (audio.readyState >= 1) audio.currentTime = clamp(value, 0, audio.duration || value);
    else pendingSeekRef.current = value;
  }, []);

  const moveTrack = useCallback(
    (direction) => {
      const items = queueRef.current;
      if (!items.length) return;
      const index = items.findIndex((track) => sameTrack(track, currentTrackRef.current));
      let next;
      if (shuffleRef.current && items.length > 1) {
        do {
          next = items[Math.floor(Math.random() * items.length)];
        } while (sameTrack(next, currentTrackRef.current));
      } else {
        next = items[(index + direction + items.length) % items.length];
      }
      playTrack(next);
    },
    [playTrack]
  );

  const nextTrack = useCallback(() => moveTrack(1), [moveTrack]);
  const prevTrack = useCallback(() => {
    if (progressRef.current > 5) {
      handleSeek(0);
      return;
    }
    moveTrack(-1);
  }, [handleSeek, moveTrack]);

  endedHandlerRef.current = () => {
    if (repeatRef.current) {
      handleSeek(0);
      startAudio(currentTrackRef.current, 0);
    } else {
      nextTrack();
    }
  };

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
    const payload = {
      currentId,
      progress,
      volume,
      muted,
      shuffle,
      repeat,
      liked: [...liked],
      source,
      currentTrack: serializeTrack(currentTrack),
      queue: queue.slice(0, 60).map(serializeTrack),
      likedTracks,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage can be unavailable in private mode; playback still works in memory.
    }
  }, [
    currentId,
    progress,
    volume,
    muted,
    shuffle,
    repeat,
    liked,
    source,
    currentTrack,
    queue,
    likedTracks,
  ]);

  const toggleLike = useCallback((input) => {
    const track = input && typeof input === "object" ? input : null;
    const id = String(track?.id ?? input);
    if (!id) return;
    setLiked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (track) {
      setLikedTracks((current) => ({ ...current, [id]: serializeTrack(track) }));
    }
  }, []);

  const changeVolume = useCallback((value) => {
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const value = useMemo(
    () => ({
      queue,
      currentId,
      currentTrack,
      playing,
      progress,
      duration,
      audioError,
      loadingStream,
      liked,
      likedTracks,
      shuffle,
      repeat,
      volume,
      muted,
      queueOpen,
      source,
      playTrack,
      playTracks,
      enqueueTracks,
      togglePlay,
      nextTrack,
      prevTrack,
      handleSeek,
      pauseAudio,
      setSource,
      setQueueOpen,
      toggleLike,
      changeVolume,
      toggleShuffle: () => setShuffle((current) => !current),
      toggleRepeat: () => setRepeat((current) => !current),
      toggleMute: () => setMuted((current) => !current),
    }),
    [
      queue,
      currentId,
      currentTrack,
      playing,
      progress,
      duration,
      audioError,
      loadingStream,
      liked,
      likedTracks,
      shuffle,
      repeat,
      volume,
      muted,
      queueOpen,
      source,
      playTrack,
      playTracks,
      enqueueTracks,
      togglePlay,
      nextTrack,
      prevTrack,
      handleSeek,
      pauseAudio,
      toggleLike,
      changeVolume,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
}
