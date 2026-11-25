import { useMemo } from "react";
import Hero from "../components/Hero";
import GenreSection from "../components/GenreSection";
import TrendingSection from "../components/TrendingSection";
import AudiusSection from "../components/AudiusSection";
import SpotifySection from "../components/SpotifySection";
import MadeForYou from "../components/MadeForYou";
import TopCharts from "../components/TopCharts";
import Footer from "../components/Footer";
import {
  DynamicCharts,
  FavouriteSongsStrip,
  RecentlyPlayedStrip,
  RecommendedForYou,
} from "../components/HomeExtras";
import { usePlayer } from "../context/PlayerContext";
import { usePopularMusic } from "../hooks/usePopularMusic";
import { TRACKS } from "../data/music";

const localTracks = TRACKS.map((track) => ({ ...track, source: "local", src: track.src }));

export default function HomePage({
  activeGenre,
  onSelectGenre,
  onPlayTrack,
  onPlayTracks,
  onOpenArtist,
  onOpenAlbum,
  onPlaySpotifyTrack,
  onOpenPath,
  onOpenSpotify,
  spotify,
}) {
  const { currentId, playing, currentTrack, liked, toggleLike } = usePlayer();
  const { byGenre, globalPopular, dailyMixes, loading: popularLoading } = usePopularMusic();
  const scrollToId = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Popular Audius tracks replace the old demo catalogue on the home page.
  // Local CC tracks are kept only as an offline fallback so playback never breaks.
  const popularTracks = useMemo(
    () => (globalPopular.length ? globalPopular : localTracks),
    [globalPopular]
  );
  const genreTracks = activeGenre && byGenre[activeGenre]?.length
    ? byGenre[activeGenre]
    : popularTracks;

  return (
    <div className="page">
      <Hero
        onStart={() => onPlayTrack(popularTracks[0])}
        onExplore={() => scrollToId("genres")}
        nowPlaying={currentTrack}
      />

      <GenreSection
        activeGenre={activeGenre}
        onSelect={onSelectGenre}
        onSeeAll={() => scrollToId("trending")}
        counts={byGenre}
      />

      <div id="audius">
        <AudiusSection
          onPlayTrack={onPlayTrack}
          onPlayTracks={onPlayTracks}
          currentId={currentId}
          playing={playing}
          onOpenArtist={onOpenArtist}
          onOpenAlbum={onOpenAlbum}
        />
      </div>

      <TrendingSection
        activeGenre={activeGenre}
        tracks={genreTracks}
        loading={popularLoading && !globalPopular.length}
        onPlay={onPlayTrack}
        currentId={currentId}
        playing={playing}
        onStartMixing={() => onOpenPath("/playlists")}
      />

      <DynamicCharts
        onPlayTrack={onPlayTrack}
        currentId={currentId}
        playing={playing}
        onOpenArtist={onOpenArtist}
      />

      <RecommendedForYou
        onPlayTrack={onPlayTrack}
        currentId={currentId}
        playing={playing}
        onOpenArtist={onOpenArtist}
      />

      <SpotifySection
        spotify={spotify}
        onPlayTrack={onPlaySpotifyTrack}
        onOpenSpotify={onOpenSpotify}
      />

      <MadeForYou
        dailyMixes={dailyMixes}
        onPlay={onPlayTrack}
        onPlayPlaylist={(playlist) => onPlayTracks(playlist.tracks, 0)}
        currentId={currentId}
        playing={playing}
        onSeeAll={() => onOpenPath("/playlists")}
      />

      <TopCharts
        tracks={globalPopular.slice(0, 10)}
        onPlay={onPlayTrack}
        currentId={currentId}
        playing={playing}
        liked={liked}
        onToggleLike={toggleLike}
      />

      <RecentlyPlayedStrip onPlayTrack={onPlayTrack} currentId={currentId} playing={playing} />
      <FavouriteSongsStrip />

      <Footer />
    </div>
  );
}
