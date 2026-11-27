# PULSE — Phase 1

Premium wellness and fitness platform foundation. Phase 1 covers the brand identity, responsive
homepage, navigation and reusable component system.

**Tagline:** Move Better. Live Stronger.

## What is included

- React + Vite (JavaScript)
- Bootstrap 5 with a custom design system
- React Router navigation
- Lucide React icons
- Framer Motion animations (with reduced-motion support)
- Fully responsive homepage with mobile menu
- Seven feature preview pages
- Clearly labeled demo dashboard data and sample testimonials
- Accessible forms, controls, focus states and skip link

## Colors

| Token | Value |
| --- | --- |
| Deep Forest | `#101D19` |
| Emerald Green | `#36C98F` |
| Lime | `#B5F36B` |
| Soft White | `#F4F7F2` |
| Sage Grey | `#66766C` |

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production check

```bash
npm run build
npm run preview
```

## Project structure

```text
pulse/
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── components/
│   │   ├── sections/
│   │   ├── Button.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Reveal.jsx
│   │   ├── SectionHeading.jsx
│   │   └── TopicPage.jsx
│   ├── data/
│   │   └── features.js
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```

## Roadmap status

Phase 1 only. Authentication, database, dashboards, tracking tools, AI coaching and deployment are
intentionally not implemented. Login and Get Started screens clearly mark those capabilities as
upcoming roadmap phases.

Photography is bundled locally from Unsplash. Dashboard data and testimonials are illustrative
samples, not real user information.
