# VYRA

A premium music-discovery and streaming UI — *Feel the Music. Live the Moment.* The established purple/blue glass design is preserved while the app now uses real music sources: Audius for searchable, playable tracks and Spotify for official discovery links and embeds.

## Stack

- React 19 + Vite 8
- React Router for detail/library/search pages (the player stays mounted above routes)
- Framer Motion for transitions
- lucide-react for icons
- Bootstrap 5 reset/grid plus hand-written CSS in `src/styles/`
- Audius REST API (`https://api.audius.co/v1`) for playable music
- Spotify Web API / official embeds and optional Web Playback SDK

The 26 bundled CC BY vocal tracks remain as a real, offline-friendly catalogue and fallback. Audius is the primary online playable source; Spotify is secondary discovery only — VYRA never downloads, extracts, or fakes Spotify audio.

## Setup

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173/> (use `127.0.0.1`, not `localhost`, so the Spotify redirect URI matches exactly).

Production build:

```bash
npm run build
npm run preview
```

> Every `VITE_*` environment variable is embedded in the browser bundle. Use only public identifiers and read-only API keys. Never put an API secret, client secret, or access token in `.env.local`, source code, or chat.

## Audius setup (primary playable source)

1. Create an app in [Audius settings → Manage Your Apps](https://audius.co/settings) or review the [API plans](https://api.audius.co/plans).
2. Copy the read-only **API Key**. Do **not** copy the API Secret into this project.
3. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_AUDIUS_API_KEY=your_audius_api_key
   ```

4. Restart `npm run dev`.

When the key is missing, Audius sections show a setup card instead of crashing. With a key, the app loads real trending tracks, genre-based Afrobeats results, latest releases, popular artists, albums, and full-text search from official Audius endpoints. Artwork mirrors are retried automatically. Streams are resolved through Audius’s stream endpoint only when a track is played.

> Audius does not provide an official “Nigeria chart” endpoint. VYRA labels Afrobeats/Nigeria sections as provider/genre-based discovery rather than inventing chart positions.

## Spotify setup (secondary discovery)

The local and Audius catalogues work without Spotify. Spotify search, embeds, and optional Web Playback are additive.

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add these exact Redirect URIs in the app settings:
   - `http://127.0.0.1:5173/`
   - `https://vyra-azure-iota.vercel.app/`
3. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
   ```

4. Restart the dev server and open <http://127.0.0.1:5173/>.
5. For a deployed build, set `VITE_SPOTIFY_REDIRECT_URI=https://vyra-azure-iota.vercel.app/` in Vercel and redeploy.

A Spotify **client ID is public configuration**. Authorization uses Authorization Code + PKCE with a random state, short-lived verifier, callback cleanup, refresh tokens, and friendly errors for cancellation, expiry, rate limits, restricted content, and network failures — no client secret or password is stored in the browser. Spotify Premium is required for the optional Web Playback SDK; Development Mode apps additionally require allowlisted accounts, and public access requires Spotify extended quota approval. Search, official links, and official iframe embeds work without pretending that Spotify audio plays in VYRA’s own player. Guests can dismiss Spotify and keep using Audius/local playback.

## Lyrics (LRCLIB)

The player has a **Lyrics** button on desktop and mobile. It opens a full glassmorphism lyrics view without changing the player, routes, or theme.

- Uses LRCLIB’s official CORS-enabled `GET /api/get` endpoint; no key, scraping, or lyric text is bundled in VYRA.
- Identifies the client with `X-User-Agent: VYRA v1.0 (https://vyra-azure-iota.vercel.app/)` and honours rate-limit/`Retry-After` responses. An optional public `VITE_LRCLIB_APP_ID` can be added for a higher allowance.
- Matches by track title, artist, album and duration, then rejects records whose title/artist/album/duration disagree — so a remix or different version is never displayed.
- Syncs highlighted lines to the actual `HTMLAudioElement` position (or Spotify SDK position for Spotify playback), with no guessing timer.
- Supports LRC line timestamps, plain lyrics when no timestamps exist, instrumental/unavailable states, loading/retry errors, active-line auto-scroll, and manual scroll with “Follow playback”.
- LRCLIB attribution is shown in the panel. See the [API documentation](https://lrclib.net/docs) for terms and implementation requirements.

## Deployment (Vercel)

The project is linked to Vercel as `vyra`. `vyra/vercel.json` rewrites client-side routes to `index.html` so `/search`, `/library`, `/artist/...`, and `/album/...` work on refresh.

Required Vercel environment variables:

| Variable | Value |
| --- | --- |
| `VITE_AUDIUS_API_KEY` | Your read-only Audius API key |
| `VITE_SPOTIFY_CLIENT_ID` | Spotify app Client ID |
| `VITE_SPOTIFY_REDIRECT_URI` | `https://vyra-azure-iota.vercel.app/` |
| `VITE_LRCLIB_APP_ID` | Optional public LRCLIB app ID for a higher rate limit |

Public access also requires turning off Vercel Deployment Protection for the production domain. Any Vercel token that was pasted into chat should be rotated in the Vercel dashboard.

## Features

- Real playable Audius tracks: trending, Afrobeats discovery, new releases, popular artists, albums, recommendations, and search
- Audius artist and album pages with artwork, tracklists, durations, play actions, and official links
- Debounced global search with All / Songs / Artists / Albums / Playlists tabs, Audius + Spotify results, loading/empty/error states
- Persistent bottom player that does not restart on navigation: play/pause, prev/next, shuffle, repeat, seek, volume, mute, queue, artwork, metadata, stream errors, and unavailable-track handling
- Only one audio source at a time: starting Audius/local playback pauses Spotify SDK; Spotify embeds pause VYRA audio
- Library with liked songs, saved albums/artists, recently played, and local playlists with create/rename/delete/add/remove
- 26 real CC BY vocal tracks (including 10 Nigerian vocals) as a legal fallback catalogue
- Official Spotify links and iframes for tracks/artists/albums/playlists; no downloaded or fabricated Spotify audio
- Synced/plain lyrics from LRCLIB in a full-screen player panel, tied to real playback position with safe exact-version matching
- Original VYRA design: glassmorphism, animated gradients, sidebar, hero, search, profile, notifications, settings, responsive layout

> **Music credits:** Local tracks are sourced from [ccMixter](https://ccmixter.org) and the [Free Music Archive](https://freemusicarchive.org), credited to their artists and licensed **CC BY 2.5/3.0/4.0**. The Nigerian set is by Ugo Mbaise. Per-track attribution is available in the app footer.

## Privacy and storage

No credentials are stored in app `localStorage`. The app stores only listener preferences and library data:

- `vyra:listener:v1` — last track/position, volume/mute, shuffle/repeat, likes, queue, and normalized track metadata
- `vyra:library:v1`, `vyra:playlists:v1`, `vyra:recent:v1` — saved albums/artists, playlists, and listening history
- `vyra:spotify:auth` / `vyra:spotify:pkce` — Spotify PKCE session and short-lived PKCE verifier used by the official SDK integration

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run fetch:audio` | Re-download and encode the CC BY vocal tracks into `public/audio/` |
| `npm run shots` | Capture desktop, tablet, and mobile screenshots into `.shots/` |
| `npm run audit:ui` | Audit responsive widths for overflow, clipping, contrast, tiny type, and touch targets |
| `npm run test:routes` | Verify routed pages, SPA fallback, and persistent player mounting |
| `npm run test:library` | Verify playlist create/add/rename/delete persistence |
| `npm run test:audio` | Verify real local audio files and actual playback controls |
| `npm run test:spotify` | Verify guest access, callback errors, PKCE session, Spotify search, direct SDK playback, embeds, and disconnect |
| `npm run test:lyrics` | Verify LRCLIB matching, real-position sync, track switching, plain lyrics, rejects, and mobile layout |
| `npm run test:persistence` | Verify listener state survives reloads |

QA scripts serve the built `dist/` themselves, so run `npm run build` first. Puppeteer uses `C:/Program Files/Google/Chrome/Application/chrome.exe` by default.

## Project layout

```
src/
  App.jsx                    app shell, routes, global player switching
  main.jsx                   providers (Spotify → Player → Library), router, global CSS
  context/                   PlayerContext, SpotifyContext, LibraryContext
  services/audius.js         official Audius REST client, caching, normalization, stream resolution
  services/lyrics.js         LRCLIB client, exact-version matching, LRC parsing
  lib/spotify.js             Spotify PKCE, token refresh, REST helpers
  hooks/useSpotify.js        single Spotify SDK/auth instance
  pages/HomePage.jsx         upgraded homepage composition
  components/                original VYRA UI + Audius/search/detail/library/embed/lyrics components
  data/music.js              local catalogue and legacy discovery data
  styles/                    original styles plus scoped discovery/search/detail/library/embed/lyrics CSS
public/audio/                 26 locally hosted CC BY MP3 tracks
public/images/                hero art, genre images, covers, favicon
scripts/                      audio fetch, screenshots, layout audit, persistence/audio/Spotify/lyrics tests
vercel.json                  SPA fallback for client-side routes
```
