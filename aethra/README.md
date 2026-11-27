# AETHRA

**Your Intelligence. Without Limits.**

AETHRA is a full-stack AI workspace with a premium futuristic landing page, secure accounts, streaming AI chat, an image studio, a browser-powered voice assistant, a live 3D orb, a creations library, usage history and user preferences.

The application is built with React + Vite on the frontend and Node.js + Express + MySQL-compatible SQL on the backend. Real API integrations are used for chat and image generation; when provider keys are absent, the UI shows explicit setup notices instead of pretending to generate content.

---

## Features

### Public site
- Responsive animated landing page with a Three.js signature orb
- Feature tabs for AI Chat, Image Studio, Voice and My Creations
- FAQ, feature bento grid, testimonials and final call-to-action
- Mobile navigation and reduced-motion/WebGL fallbacks

### Accounts and security
- Registration, login, logout and protected routes
- bcrypt password hashing
- Short-lived JWT access tokens plus rotating refresh tokens stored as hashes
- Password recovery with dev-link mode or SMTP email
- Profile, password and preference management
- User-scoped database queries across every private resource
- Helmet security headers, CORS allow-list and rate limiting

### Workspace
- Overview dashboard with live counts and activity timeline
- Multi-conversation chat with Server-Sent Events streaming
- Markdown, GFM tables, code highlighting, copy and regenerate actions
- Image gallery with download, save and delete
- Saved creations library with search, favourites and detail modal
- Voice assistant using browser SpeechRecognition and SpeechSynthesis
- History page with filters for chat, image and voice activity
- Theme, accent, voice and notification preferences

---

## Project structure

```text
aethra/
├── api/                  # Vercel serverless entry point
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/   # Brand, layout, states and 3D orb
│       ├── lib/          # API client and auth context
│       ├── pages/        # Landing, auth and dashboard pages
│       └── styles/       # Theme, orb, landing and app CSS
├── server/               # Express API
│   └── src/
│       ├── config/       # Environment parsing
│       ├── db/           # Pool, schema and setup script
│       ├── middleware/   # Auth, validation and error handling
│       ├── routes/       # Auth, chat, images, creations, voice, settings
│       ├── services/     # AI and image provider integrations
│       └── utils/        # Tokens and API errors
├── test/                 # Server tests
├── .env.example
├── package.json
└── vercel.json
```

---

## Quick start

### Requirements

- Node.js 20 or newer
- MySQL 8+ or a MySQL-compatible cloud database such as TiDB Cloud
- Optional: API keys for chat and image generation

### 1. Install dependencies

```powershell
npm install --no-audit --no-fund
```

### 2. Configure environment

Copy the example files:

```powershell
Copy-Item .env.example server\.env
Copy-Item .env.example client\.env.local
```

Edit `server/.env`:

- Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME`
- Generate a real `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- Set `CLIENT_URL` to your frontend origin
- Leave `AI_API_KEY` and `IMAGE_API_KEY` empty until you add provider keys

Edit `client/.env.local`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Create the database

```powershell
npm run db:setup
```

This creates `aethra_db` if needed and applies all tables, keys and relationships. It never touches other databases on the same server.

### 4. Run locally

```powershell
npm run dev
```

The API runs on `http://localhost:4000` and the frontend on `http://localhost:5173`. If port 5173 is occupied, Vite automatically uses the next available port.

---

## AI provider setup

Credentials stay on the server. They are never sent to the browser or committed.

### Chat

Supported providers: `openai`, `groq`, `openrouter`, `together`.

```env
AI_PROVIDER=openai
AI_API_KEY=your_private_key
AI_MODEL=gpt-4o-mini
```

For another provider, set the matching model and optional base URL:

```env
AI_PROVIDER=groq
AI_API_KEY=your_groq_key
AI_MODEL=llama-3.3-70b-versatile
```

### Images

Supported providers: `openai`, `together`, `stability`.

```env
IMAGE_PROVIDER=openai
IMAGE_API_KEY=your_private_key
IMAGE_MODEL=gpt-image-1
```

Restart the API after changing environment variables. `/api/health` reports `aiConfigured` and `imageConfigured` so the frontend can show accurate setup notices.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and frontend together |
| `npm start` | Start the production Express API |
| `npm run build` | Build the production frontend |
| `npm run db:setup` | Create/refresh the database schema |
| `npm test` | Run server tests |
| `npm run check` | Run tests and production build |

---

## API overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Service and configuration status |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Sign in |
| `POST` | `/api/auth/refresh` | No | Rotate tokens |
| `POST` | `/api/auth/logout` | No | Revoke refresh token |
| `POST` | `/api/auth/forgot-password` | No | Prepare password reset |
| `POST` | `/api/auth/reset-password` | No | Complete password reset |
| `GET` | `/api/auth/me` | Yes | Current account |
| `GET` | `/api/chat/conversations` | Yes | List conversations |
| `POST` | `/api/chat/conversations` | Yes | Create conversation |
| `GET` | `/api/chat/conversations/:id/messages` | Yes | Load messages |
| `DELETE` | `/api/chat/conversations/:id` | Yes | Delete conversation |
| `POST` | `/api/chat/messages` | Yes | Stream an AI reply (SSE) |
| `POST` | `/api/chat/regenerate/:messageId` | Yes | Regenerate a reply |
| `GET` | `/api/images/config` | Yes | Provider configuration |
| `POST` | `/api/images/generate` | Yes | Generate an image |
| `GET` | `/api/images` | Yes | Image history |
| `GET` | `/api/images/:id/file` | Yes | Download image bytes |
| `DELETE` | `/api/images/:id` | Yes | Delete image |
| `POST` | `/api/images/:id/save` | Yes | Save to creations |
| `GET` | `/api/creations` | Yes | Search creations |
| `PATCH` | `/api/creations/:id` | Yes | Update creation |
| `DELETE` | `/api/creations/:id` | Yes | Remove creation |
| `POST` | `/api/voice/sessions` | Yes | Record voice usage |
| `GET` | `/api/settings` | Yes | Profile, preferences and usage |
| `PATCH` | `/api/settings/profile` | Yes | Update profile |
| `PATCH` | `/api/settings/preferences` | Yes | Update preferences |
| `POST` | `/api/settings/password` | Yes | Change password |
| `GET` | `/api/settings/usage` | Yes | Usage totals and recent activity |

---

## Database

Tables created by `server/src/db/schema.sql`:

- `users`
- `refresh_tokens`
- `conversations`
- `messages`
- `generated_images`
- `saved_creations`
- `user_preferences`
- `usage_records`

All private tables are linked to `users.id`, indexed for common lookups and protected with foreign keys. Image bytes and message content belong to the authenticated user only.

---

## Deployment

### Vercel

`vercel.json` builds the Vite frontend and routes `/api/*` to the Express app through `api/index.js`.

Before deploying, set these environment variables in the Vercel project:

```text
NODE_ENV=production
CLIENT_URL=https://your-deployment.vercel.app
DB_HOST=...
DB_PORT=4000
DB_USER=...
DB_PASSWORD=...
DB_NAME=aethra_db
DB_SSL=true
JWT_SECRET=<long random value>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
MAIL_MODE=smtp
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="AETHRA <no-reply@your-domain>"
AI_PROVIDER=...
AI_API_KEY=...
AI_MODEL=...
IMAGE_PROVIDER=...
IMAGE_API_KEY=...
IMAGE_MODEL=...
```

`VITE_API_URL=/api` is set by `vercel.json`, so the built frontend calls the same origin.

Run database setup once against the production database before using the app:

```powershell
npm run db:setup
```

### Separate API host

You can also deploy `server/` to any Node host and set `VITE_API_URL` to the full API URL when building the client. Make sure `CLIENT_URL` on the API matches the frontend origin.

---

## Security notes

- Never commit `server/.env` or `client/.env.local`.
- Use a long random `JWT_SECRET` in production.
- Keep `DB_SSL=true` for remote database providers.
- `MAIL_MODE=dev` returns reset links in API responses and must not be used in production.
- Provider keys are read only by the server and are never included in frontend bundles.
- `npm run check` verifies both the server tests and the production client build.

---

## Troubleshooting

**Database setup fails with a foreign key error**  
Run `npm run db:setup` again. The setup script strips SQL comments before executing statements in order.

**Chat or image pages show a setup notice**  
Add the relevant provider key to `server/.env` and restart the API. No fake results are generated.

**Frontend calls localhost after deployment**  
Rebuild with `VITE_API_URL=/api` for Vercel, or set it to your public API URL.

**Port 5173 is already in use**  
Vite automatically selects the next free port. Update `CLIENT_URL` and `client/.env.local` only if you need a fixed port.
