# VYRA

A premium music-streaming web UI — *Feel the Music. Live the Moment.* Built as a single-page React app with a dark, glassy visual language, animated gradients, and a persistent bottom player.

## Stack

- React 19 + Vite 8
- Framer Motion for transitions
- lucide-react for icons
- Bootstrap 5 CSS reset/grid plus hand-written CSS in `src/styles/`

Tracks are real, full-length vocal MP3 files from ccMixter and the Free Music Archive, licensed Creative Commons BY. The catalogue includes a Nigerian/Igbo set from Ugo Mbaise. There is also an optional Spotify Web Playback integration for official chart hits. Catalogue metadata, playlists, charts and notifications live in `src/data/music.js`. There is no backend; Spotify playback uses Spotify's official APIs directly from the browser.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. For a production build:

```bash
npm run build
npm run preview
```

## Spotify setup (optional)

The local CC catalogue works without any configuration. To play official songs by Rema, Davido, Asake, Ayra Starr and others:

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add `http://localhost:5173/` as a redirect URI in that app's settings. Use your deployed URL too if you publish the site.
3. Copy `.env.example` to `.env.local` and set `VITE_SPOTIFY_CLIENT_ID` to your app's **Client ID**. The account overview page does not show this; the Developer Dashboard does.
4. Restart `npm run dev`, scroll to **Popular Naija**, and choose **Connect Spotify**.

A **Spotify Premium** account is required for Web Playback. The app uses PKCE, so no client secret is stored in the browser. Audio streams from Spotify and is never bundled or saved locally. If the Spotify app is not configured, the section shows setup instructions instead of failing.

## Features

- 26 real full-length vocal tracks (including 10 Nigerian vocals) with play/pause, next/prev, shuffle, repeat, seek, volume, mute, like, queue drawer and fullscreen
- Optional Spotify Web Playback mode with PKCE login and a “Popular Naija” search rail for Rema, Davido, Asake, Ayra Starr and more
- Genre filtering, tabs, playlists, artist-style mix cards, charts and spotlight section
- Search with live track/genre results (`Ctrl/Cmd + K` to focus)
- Responsive layout across desktop, tablet and mobile widths
- Listener state persisted to `localStorage` under `vyra:listener:v1`: last track and position, volume/mute, shuffle/repeat and liked songs
- Keyboard: `Space` toggles playback

> **Music:** 26 full-length vocal tracks sourced from [ccMixter](https://ccmixter.org) and the [Free Music Archive](https://freemusicarchive.org), each credited to its artist and licensed **CC BY 2.5/3.0/4.0**. The Nigerian set is by Ugo Mbaise. Files are stored in `public/audio/` and encoded at 96 kbps. Per-track attribution, source pages and licence links are available in the app footer under “Music credits”. The `AudioContext` synthesizer from the prototype has been removed.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run fetch:audio` | Download and encode the CC BY vocal tracks from ccMixter and FMA into `public/audio/` (requires internet; uses `ffmpeg-static` if installed) |
| `npm run shots` | Capture desktop, tablet and mobile screenshots into `.shots/` |
| `npm run audit:ui` | Audit 8 viewport widths for overflow, clipped text, contrast, tiny type and touch targets; writes `.shots/ui-audit.json` |
| `npm run test:persistence` | Verify listener state survives reloads |
| `npm run test:audio` | Verify local audio files exist and the player starts, pauses and changes tracks |

The QA scripts serve the built `dist/` themselves on an ephemeral port, so **run `npm run build` first**; no dev server is needed. Puppeteer uses `C:/Program Files/Google/Chrome/Application/chrome.exe` by default — set `EXE` in the script if Chrome lives elsewhere.

## Project layout

```
src/
  App.jsx               page composition + local/Spotify player switching and persistence
  components/           Sidebar, TopBar, Hero, genre/trending/mixes/charts, Player, Footer,
                        SpotifySection, SpotifyPlayer
  hooks/useSpotify.js   Spotify auth token, SDK player and playback controls
  lib/spotify.js        PKCE login, token refresh and Spotify API helpers
  data/music.js         catalogue data and local audio paths
  styles/               base.css, layout.css, home.css, player.css, spotify.css
public/audio/           26 locally hosted MP3 tracks
public/images/          hero art, genre images, covers, favicon
scripts/                audio fetch, screenshot, layout audit, persistence and audio tests
```

## Asset notes

`public/images/` contains a few unused reference/candidate images (`hero-v2.jpg`, `ref-*.jpg`, `promo-ref.jpg`, `trending-row-ref.jpg`, `genres-row-ref.jpg`) kept for design iteration; they can be removed before release.
