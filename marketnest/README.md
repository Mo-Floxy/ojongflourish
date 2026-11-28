# Marketnest

A marketplace for independent makers and local shops. This is a clean rebuild of the project: a
Django REST API scaffold plus a React/Vite frontend.

> Current phase: **UI-first**. All screens are implemented against a mock API in
> `frontend/src/api/client.js`, seeded from `frontend/src/data/mock.js`. The Django backend is a
> lean scaffold with a health endpoint and CORS configured, ready for the real endpoints.

## Stack

- **Backend:** Django 5.2, Django REST Framework, django-cors-headers, SimpleJWT
- **Frontend:** React 19, Vite 8, React Router 7, lucide-react
- **Styling:** plain CSS design system in `frontend/src/styles/` (no UI framework)

## Getting started

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Copy `.env.example` to `.env` to override the secret key, debug flag, allowed hosts and CORS
origins. The API health check is at `http://127.0.0.1:8000/api/health/`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the Django server, so once real endpoints
exist the frontend can call them directly. `npm run build` produces the production bundle in
`dist/`.

## Project structure

```
marketnest/
├── backend/
│   ├── config/          # Django settings, URLs, ASGI/WSGI
│   ├── apps/core/       # Health endpoint; add feature apps here
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── public/images/   # Product, shop, logo, avatar and hero photography
    └── src/
        ├── api/         # Mock API client (swap for axios + /api later)
        ├── components/  # Shared UI components
        ├── context/     # Auth, cart, favourites, toasts
        ├── data/        # Mock seed data
        ├── layouts/     # Public and dashboard shells
        ├── pages/       # Public, customer dashboard and vendor screens
        ├── styles/      # Design tokens, base, shared and page CSS
        └── App.jsx      # Routes
```

## Switching from mock data to the real API

1. Add Django apps/models/serializers/views under `backend/apps/` and include their URLs in
   `backend/config/urls.py`.
2. In `frontend/src/api/client.js`, replace the mock adapter with axios calls to `/api/...`.
   Keep the exported `api`, `apiError`, `fieldErrors` and `mediaUrl` helpers so pages need no
   changes.
3. Regenerate the real image set with `python prepare_images.py` from the project root. It reads
   the workspace `vibe_images` artwork and writes polished crops into `frontend/public/images/`.

## Notes

- The demo auth context logs in as a customer by default. Use the buttons on the login screen to
  switch between customer and vendor views.
- Cart, favourites and the demo user persist in `localStorage`.
- Dark mode is available from the moon/sun button in the navbar. The theme choice is saved
  locally; **Settings → Appearance & locale** also offers Light, Dark and Match my device.
- The visual system uses a midnight plum, burnt orange and warm ivory palette; tokens live in
  `frontend/src/styles/tokens.css` and dark overrides in `frontend/src/styles/dark.css`.
