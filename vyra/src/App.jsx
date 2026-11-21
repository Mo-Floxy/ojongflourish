import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Player from "./components/Player";
import SpotifyPlayer from "./components/SpotifyPlayer";
import SpotifyConnectDialog from "./components/SpotifyConnectDialog";
import LyricsPanel from "./components/LyricsPanel";
import HomePage from "./pages/HomePage";
import SearchPage from "./components/SearchPage";
import ArtistPage from "./components/ArtistPage";
import AlbumPage from "./components/AlbumPage";
import LibraryPage from "./components/LibraryPage";
import PlaylistPage from "./components/PlaylistPage";
import { usePlayer } from "./context/PlayerContext";
import { useSpotifyContext } from "./context/SpotifyContext";
import { useTheme } from "./hooks/useTheme";

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const spotify = useSpotifyContext();
  const player = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [spotifyDialogOpen, setSpotifyDialogOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const playerState = player.source === "spotify" && spotify.track ? "spotify" : "local";

  const lyricsTrack = useMemo(() => {
    if (playerState === "spotify" && spotify.track) {
      const item = spotify.track;
      return {
        key: item.uri || item.id || `spotify:${item.name}`,
        source: "spotify",
        title: item.name,
        artist: item.artists?.map((artist) => artist.name).join(", ") || "Spotify",
        album: item.album?.name || "",
        duration: (item.duration_ms || 0) / 1000,
        art: item.album?.images?.at(-1)?.url || item.album?.images?.[0]?.url || "",
      };
    }
    const item = player.currentTrack;
    if (!item) return null;
    return {
      key: `${item.source || "local"}:${item.id}`,
      source: item.source || "local",
      title: item.title,
      artist: item.artist,
      album: item.album || "",
      duration: item.duration || 0,
      art: item.cover || item.artwork || "",
    };
  }, [playerState, spotify.track, player.currentTrack]);

  const lyricsPosition = playerState === "spotify" ? (spotify.position || 0) / 1000 : player.progress || 0;

  const openLyrics = useCallback(() => setLyricsOpen(true), []);
  const closeLyrics = useCallback(() => setLyricsOpen(false), []);

  const openSpotifyDialog = useCallback(() => {
    setMenuOpen(false);
    setSpotifyDialogOpen(true);
  }, []);

  const activeNav = (() => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/search") return "search";
    if (path.startsWith("/playlists")) return "playlists";
    if (path.startsWith("/artist")) return "artists";
    if (path.startsWith("/album")) return "albums";
    if (path === "/library") {
      const tab = new URLSearchParams(location.search).get("tab");
      return tab === "artists" || tab === "albums" || tab === "recent" ? tab : "liked";
    }
    return "home";
  })();

  const openPath = useCallback(
    (path) => {
      setMenuOpen(false);
      if (location.pathname === path) return;
      navigate(path);
    },
    [location.pathname, navigate]
  );

  const handleNavigate = useCallback(
    (id) => {
      setMenuOpen(false);
      const targets = {
        home: "/",
        search: "/search",
        library: "/library?tab=liked",
        playlists: "/playlists",
        artists: "/library?tab=artists",
        albums: "/library?tab=albums",
        liked: "/library?tab=liked",
      };
      const target = targets[id];
      if (!target) return;
      if (id === "home" && location.pathname === "/") {
        scrollToId("top");
        return;
      }
      if (location.pathname + location.search === target) {
        setActiveGenre(null);
        return;
      }
      navigate(target);
    },
    [location.pathname, location.search, navigate]
  );

  const selectGenre = useCallback(
    (id) => {
      setActiveGenre(id);
      if (location.pathname !== "/") navigate("/");
      window.setTimeout(() => scrollToId("trending"), 120);
    },
    [location.pathname, navigate]
  );

  const playSpotifyTrack = useCallback(
    async (item) => {
      if (!item?.uri) return;
      const started = await spotify.playTracks([item.uri]);
      if (started) {
        player.pauseAudio();
        player.setSource("spotify");
      }
    },
    [spotify, player]
  );

  const openArtist = useCallback(
    (artist) => {
      if (!artist?.id) return;
      navigate(`/artist/audius/${encodeURIComponent(artist.id)}`, {
        state: { artist },
      });
    },
    [navigate]
  );

  const openAlbum = useCallback(
    (album) => {
      if (!album?.id) return;
      navigate(`/album/audius/${encodeURIComponent(album.id)}`, {
        state: { album },
      });
    },
    [navigate]
  );

  useEffect(() => {
    if (spotify.track && spotify.playing) {
      player.pauseAudio();
      player.setSource("spotify");
    }
  }, [spotify.track, spotify.playing, player.pauseAudio, player.setSource]);

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;
      if (event.code !== "Space") return;
      event.preventDefault();
      if (player.source === "spotify") spotify.toggle();
      else if (player.source !== "embed") player.togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player.source, player.togglePlay, spotify.toggle]);

  const leaveSpotify = useCallback(() => {
    spotify.pause();
    player.setSource("local");
    player.playTrack(player.currentTrack);
  }, [spotify, player]);

  return (
    <div className="app">
      <div className="bg-fx" aria-hidden="true">
        <span className="bg-fx__blob bg-fx__blob--violet" />
        <span className="bg-fx__blob bg-fx__blob--blue" />
        <span className="bg-fx__grain" />
      </div>

      {spotify.error && (
        <div className="spotify-toast" role="alert">
          <span className="spotify-toast__dot" aria-hidden="true" />
          <span className="spotify-toast__message">{spotify.error}</span>
          {!spotify.authenticated && (
            <button type="button" onClick={openSpotifyDialog}>Connect</button>
          )}
          <button type="button" className="spotify-toast__dismiss" onClick={spotify.clearError}>
            Dismiss
          </button>
        </div>
      )}

      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        likedCount={player.liked.size}
        onUpgrade={openSpotifyDialog}
        spotifyConnected={spotify.authenticated}
        spotifyName={spotify.user?.display_name || spotify.user?.id || ""}
        themeDark={theme === "dark"}
        onToggleTheme={toggleTheme}
      />

      <main className="main">
        <TopBar
          onMenu={() => setMenuOpen(true)}
          onPlayTrack={player.playTrack}
          onPlaySpotifyTrack={playSpotifyTrack}
          onGenreSelect={selectGenre}
          onOpenSpotify={openSpotifyDialog}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                activeGenre={activeGenre}
                onSelectGenre={selectGenre}
                onPlayTrack={player.playTrack}
                onPlayTracks={player.playTracks}
                onOpenArtist={openArtist}
                onOpenAlbum={openAlbum}
                onPlaySpotifyTrack={playSpotifyTrack}
                onOpenPath={openPath}
                onOpenSpotify={openSpotifyDialog}
                spotify={spotify}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                onPlaySpotifyTrack={playSpotifyTrack}
                onOpenSpotify={openSpotifyDialog}
              />
            }
          />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/playlists/:id" element={<PlaylistPage />} />
          <Route path="/artist/:source/:id" element={<ArtistPage />} />
          <Route path="/album/:source/:id" element={<AlbumPage />} />
          <Route path="*" element={<HomePage
            activeGenre={activeGenre}
            onSelectGenre={selectGenre}
            onPlayTrack={player.playTrack}
            onPlayTracks={player.playTracks}
            onOpenArtist={openArtist}
            onOpenAlbum={openAlbum}
            onPlaySpotifyTrack={playSpotifyTrack}
            onOpenPath={openPath}
            onOpenSpotify={openSpotifyDialog}
            spotify={spotify}
          />} />
        </Routes>
      </main>

      {playerState === "spotify" ? (
        <SpotifyPlayer
          spotify={spotify}
          onClose={leaveSpotify}
          onOpenLyrics={openLyrics}
          lyricsOpen={lyricsOpen}
        />
      ) : (
        <Player
          track={player.currentTrack}
          queue={player.queue}
          playing={player.playing}
          progress={player.progress}
          duration={player.duration}
          error={player.audioError}
          loading={player.loadingStream}
          onToggle={player.togglePlay}
          onNext={player.nextTrack}
          onPrev={player.prevTrack}
          onSeek={player.handleSeek}
          volume={player.volume}
          muted={player.muted}
          onVolume={player.changeVolume}
          onToggleMute={player.toggleMute}
          shuffle={player.shuffle}
          repeat={player.repeat}
          onShuffle={player.toggleShuffle}
          onRepeat={player.toggleRepeat}
          liked={player.liked}
          onToggleLike={player.toggleLike}
          queueOpen={player.queueOpen}
          onToggleQueue={() => player.setQueueOpen((open) => !open)}
          onCloseQueue={() => player.setQueueOpen(false)}
          onPlayTrack={player.playTrack}
          externalActive={player.source === "embed"}
          onReturnToVyra={leaveSpotify}
          onOpenLyrics={openLyrics}
          lyricsOpen={lyricsOpen}
        />
      )}

      <LyricsPanel
        open={lyricsOpen}
        onClose={closeLyrics}
        track={lyricsTrack}
        position={lyricsPosition}
      />

      <SpotifyConnectDialog
        open={spotifyDialogOpen}
        onClose={() => setSpotifyDialogOpen(false)}
        spotify={spotify}
      />
    </div>
  );
}
