# FlourishNexus Portfolio

A premium, glassmorphism developer portfolio built with React, Vite, Bootstrap, custom CSS, Framer Motion, Lucide React and the Web Audio API.

## Run locally

```powershell
cd "C:\Users\HP\Desktop\Aptech Training!\My Portforlio\flourishnexus-portfolio"
npm install
npm run dev
```

Open `http://localhost:5174`.

## Official assets

The following supplied files are used directly and are not regenerated:

- `src/assets/logo/fn-logo.jpeg` — official FN monogram, used in desktop/mobile navigation, footer, favicon and brand decorations.
- `src/assets/images/splash-mascot.jpeg` — official splash-screen mascot, also used as the consistent mascot decoration across pages.
- `src/assets/images/reference-12-screen.png` — supplied 12-screen design reference, included in the project for comparison.

## Optional configuration

Copy `.env.example` to `.env` and fill in the values you want to use:

```powershell
Copy-Item .env.example .env
```

- `VITE_WEB3FORMS_KEY`: enables real form delivery through Web3Forms. Without it, the form validates and then opens the visitor's email app with the message prefilled. It never displays a false success message.
- `VITE_LINKEDIN_URL`: activates the LinkedIn contact card. Without it, the card honestly shows that the profile URL has not been configured.

After changing `.env`, restart the dev server.

## Pages

- Home `/`
- About `/about`
- Skills `/skills`
- Projects `/projects`
- Experience `/experience`
- Contact `/contact`

## Notes

-Sound effects are generated with the Web Audio API, so there are no third-party audio files or copyright concerns.
- Sound is muted/unmuted with the visible toggle and the preference is saved in `localStorage`.
- Reduced-motion preferences are respected throughout the splash screen, page transitions and background effects.
