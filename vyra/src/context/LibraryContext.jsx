import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePlayer } from "./PlayerContext";

const LIBRARY_KEY = "vyra:library:v1";
const PLAYLISTS_KEY = "vyra:playlists:v1";
const RECENT_KEY = "vyra:recent:v1";
const LibraryContext = createContext(null);

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode: keep the in-memory copy.
  }
}

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `pl-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function LibraryProvider({ children }) {
  const { currentTrack, playing, source } = usePlayer();

  const [savedAlbums, setSavedAlbums] = useState(() => read(LIBRARY_KEY, {}).albums || {});
  const [savedArtists, setSavedArtists] = useState(() => read(LIBRARY_KEY, {}).artists || {});
  const [playlists, setPlaylists] = useState(() => {
    const value = read(PLAYLISTS_KEY, []);
    return Array.isArray(value) ? value : [];
  });
  const [recentTracks, setRecentTracks] = useState(() => {
    const value = read(RECENT_KEY, []);
    return Array.isArray(value) ? value : [];
  });

  const lastRecent = useRef("");

  useEffect(() => {
    write(LIBRARY_KEY, { albums: savedAlbums, artists: savedArtists });
  }, [savedAlbums, savedArtists]);

  useEffect(() => {
    write(PLAYLISTS_KEY, playlists);
  }, [playlists]);

  useEffect(() => {
    write(RECENT_KEY, recentTracks);
  }, [recentTracks]);

  useEffect(() => {
    if (!currentTrack?.id || !playing || source === "spotify" || source === "embed") return;
    const key = `${currentTrack.source || "local"}:${currentTrack.id}`;
    if (lastRecent.current === key) return;
    lastRecent.current = key;
    const item = {
      id: currentTrack.id,
      source: currentTrack.source || "local",
      sourceId: currentTrack.sourceId || currentTrack.id,
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      cover: currentTrack.cover,
      duration: currentTrack.duration,
      genre: currentTrack.genre,
      permalink: currentTrack.permalink || "",
    };
    setRecentTracks((current) => [item, ...current.filter((t) => !(t.id === item.id && t.source === item.source))].slice(0, 50));
  }, [currentTrack, playing, source]);

  const toggleSavedAlbum = useCallback((album) => {
    if (!album?.id) return;
    const key = `${album.source || "audius"}:${album.id}`;
    setSavedAlbums((current) => {
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = album;
      return next;
    });
  }, []);

  const toggleSavedArtist = useCallback((artist) => {
    if (!artist?.id) return;
    const key = `${artist.source || "audius"}:${artist.id}`;
    setSavedArtists((current) => {
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = artist;
      return next;
    });
  }, []);

  const createPlaylist = useCallback((name = "My Playlist", tracks = []) => {
    const playlist = {
      id: makeId(),
      name: name.trim() || "My Playlist",
      description: "",
      tracks: tracks.filter((track) => track?.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlaylists((current) => [playlist, ...current]);
    return playlist;
  }, []);

  const updatePlaylist = useCallback((id, changes) => {
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === id
          ? { ...playlist, ...changes, updatedAt: new Date().toISOString() }
          : playlist
      )
    );
  }, []);

  const renamePlaylist = useCallback(
    (id, name) => updatePlaylist(id, { name: name.trim() || "Untitled playlist" }),
    [updatePlaylist]
  );

  const deletePlaylist = useCallback((id) => {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== id));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    if (!track?.id) return;
    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        if (playlist.tracks.some((item) => item.id === track.id)) return playlist;
        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              tracks: playlist.tracks.filter((track) => String(track.id) !== String(trackId)),
              updatedAt: new Date().toISOString(),
            }
          : playlist
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      savedAlbums,
      savedArtists,
      playlists,
      recentTracks,
      toggleSavedAlbum,
      toggleSavedArtist,
      createPlaylist,
      updatePlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      isAlbumSaved: (album) => Boolean(album?.id && savedAlbums[`${album.source || "audius"}:${album.id}`]),
      isArtistSaved: (artist) => Boolean(artist?.id && savedArtists[`${artist.source || "audius"}:${artist.id}`]),
      getPlaylist: (id) => playlists.find((playlist) => playlist.id === id) || null,
    }),
    [
      savedAlbums,
      savedArtists,
      playlists,
      recentTracks,
      toggleSavedAlbum,
      toggleSavedArtist,
      createPlaylist,
      updatePlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used inside LibraryProvider");
  return context;
}
