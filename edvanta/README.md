# EDVANTA — Learn Without Limits

A premium, AI-powered learning platform. This repository currently contains **Phase 1** of the build: the React + Vite frontend foundation and the complete public homepage.

## Phase 1 scope (implemented)

- React 18 + Vite (JavaScript only), Bootstrap 5, React Router DOM, Framer Motion and Lucide React.
- Full EDVANTA color system in `src/styles/theme.css`.
- Global design system, buttons, typography, responsive navbar and footer in `src/styles/global.css`.
- Homepage sections in `src/components/home/`:
  - Immersive hero with a floating learning-dashboard composition, AI assistant visual, animated progress ring and activity bars.
  - Featured courses with category imagery, level, duration, lessons, rating and enrollment information.
  - Learning categories, Why EDVANTA, learning paths preview, student progress showcase and final CTA.
- Course imagery: locally generated branded SVG artwork in `public/images/covers/` with optional Unsplash photos and automatic fallback when offline.
- Mobile navigation with an animated menu, hash-scroll handling and reduced-motion support.
- Honest placeholder routes (`/course/:slug`, `/coming-soon/:feature`, 404) for functionality scheduled in later phases.

Not included yet (by design): backend, database, authentication, course discovery filters, course detail pages, dashboard, learning environment, AI assistant, code runner, quizzes, certificates, instructor and admin systems.

## Run locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5199`.

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
edvanta/
├── public/
│   ├── favicon.svg
│   └── images/covers/       # generated offline-safe SVG course art
├── scripts/
│   └── generate-covers.mjs  # regenerate branded cover art
├── src/
│   ├── components/
│   │   ├── common/          # Brand, SectionHeading, CourseCard, ScrollManager
│   │   ├── home/            # homepage sections
│   │   └── layout/          # Navbar, Footer
│   ├── data/homeData.js     # Phase 1 sample content (clearly demo data)
│   ├── pages/               # Home, ComingSoon, NotFound
│   ├── routes/AppRoutes.jsx
│   ├── styles/              # theme, global and homepage CSS
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```

## Notes

All learner counts, ratings and course content on the homepage are illustrative sample data for Phase 1. Real data will come from the MySQL API in Phase 4+.

Verification performed for Phase 1:

- `npm run build` completes without errors.
- Rendered DOM checked in headless Chrome: all 7 homepage sections, 8 course cards, hero copy, AI visual and footer present, with no console errors.
- Mobile smoke test at 390px: no horizontal overflow, hamburger menu opens with 5 links, body scroll locks, and "Learning Paths" navigation closes the menu and scrolls to `#paths`.
- Desktop smoke test at 1440px: 4-column category grid, 2-column hero, no horizontal overflow.
- Reference captures in `design-previews/` (`edvanta-desktop.png`, `edvanta-mobile.png`). `scripts/verify-ui.mjs` and `scripts/capture-shots.mjs` repeat these checks against a Chrome instance started with `--remote-debugging-port=9333`.

Next up: **Phase 2** — course discovery with working filters and dynamic course details pages.
