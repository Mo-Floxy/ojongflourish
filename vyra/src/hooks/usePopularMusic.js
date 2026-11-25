import { useEffect, useMemo, useState } from "react";
import { GENRES } from "../data/music";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import {
  getGlobalPopular,
  getPopularTracksByGenre,
  readPopularCache,
} from "../services/popular";
import {
  buildDailyMixes,
  preferenceSignature,
  readDailyMixes,
  todayKey,
  writeDailyMixes,
} from "../services/dailyMix";

/** Loads real popular tracks for every genre and keeps today's mixes in sync. */
export function usePopularMusic() {
  const { liked, likedTracks } = usePlayer();
  const { recentTracks, savedArtists } = useLibrary();
  const [byGenre, setByGenre] = useState(readPopularCache);
  const [globalPopular, setGlobalPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      const global = await getGlobalPopular({ signal: controller.signal });
      if (!cancelled) setGlobalPopular(global);

      await Promise.all(
        GENRES.map(async (genre) => {
          const tracks = await getPopularTracksByGenre(genre.id, {
            signal: controller.signal,
          });
          if (!cancelled && tracks.length) {
            setByGenre((current) => ({ ...current, [genre.id]: tracks }));
          }
        })
      );

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const dateKey = todayKey();
  const signature = useMemo(
    () =>
      preferenceSignature({
        liked: [...liked],
        recent: recentTracks.map((track) => track.id),
        artists: Object.keys(savedArtists || {}),
      }),
    [liked, recentTracks, savedArtists]
  );

  const dailyMixes = useMemo(() => {
    const cached = readDailyMixes(dateKey, signature);
    if (cached) return cached;

    if (loading) return [];
    const mixes = buildDailyMixes({
      catalog: byGenre,
      globalPopular,
      likedTracks,
      recentTracks,
      savedArtists,
      dateKey,
      signature,
    });
    if (mixes.length) writeDailyMixes({ dateKey, signature, mixes });
    return mixes;
  }, [
    byGenre,
    dateKey,
    globalPopular,
    likedTracks,
    loading,
    recentTracks,
    savedArtists,
    signature,
  ]);

  return { byGenre, globalPopular, dailyMixes, loading, dateKey };
}
