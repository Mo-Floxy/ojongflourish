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
  spotify,
}) {
  const { currentId, playing, currentTrack, liked, toggleLike } = usePlayer();
  const scrollToId = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="page">
      <Hero
        onStart={() => onPlayTrack(localTracks[0])}
        onExplore={() => scrollToId("genres")}
        nowPlaying={currentTrack}
      />

      <GenreSection
        activeGenre={activeGenre}
        onSelect={onSelectGenre}
        onSeeAll={() => scrollToId("trending")}
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
        onPlay={(input) => onPlayTrack(typeof input === "string" ? input : input)}
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

      <SpotifySection spotify={spotify} onPlayTrack={onPlaySpotifyTrack} />

      <MadeForYou
        onPlay={(input) => onPlayTrack(input)}
        currentId={currentId}
        playing={playing}
        onSeeAll={() => onOpenPath("/playlists")}
      />

      <TopCharts
        onPlay={(input) => onPlayTrack(input)}
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
