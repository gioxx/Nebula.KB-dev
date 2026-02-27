---
id: m365-tenant-checker
title: Microsoft 365 Tenant Checker
description: Quickly verify whether a domain belongs to a Microsoft 365 tenant, via API and minimal web UI.
sidebar_position: 2
tags:
  - Projects
  - Microsoft 365
  - Tenant Checker
---

# Microsoft 365 Tenant Checker

Small Flask-based utility that queries Microsoft's Autodiscover endpoint to determine if a domain is tied to a Microsoft 365 tenant (Exchange Online, Teams, etc.). It exposes a JSON API and a lightweight HTML page, ready for Docker or Render.com deployment.

## Demo and repository
- Live demo: **https://m365-tenant-checker.onrender.com**
- Source code: [github.com/gioxx/m365-tenant-checker](https://github.com/gioxx/m365-tenant-checker)

## Key features
- 🔎 Instant domain check against Autodiscover.
-, REST API: `GET /check?domain=example.com` returning JSON.
- 🌐 Minimal web interface with Light/Dark toggle.
- 🐳 Public Docker image (`ghcr.io/gioxx/m365-tenant-checker:latest`).
- ☁️ Render.com-ready via `gunicorn`.

## Architecture at a glance
- **Backend** (`backend/app.py`): Flask serves `/check` and the static page. It issues a `GET` to `https://autodiscover-s.outlook.com/autodiscover/autodiscover.json?Email=test@<domain>&Protocol=Autodiscoverv1` with a 5s timeout.
- **Frontend** (`frontend/index.html`): Single input form, fetches `/check`, shows textual feedback, includes a theme toggle.
- **Container** (`Dockerfile`): Python slim image, installs `Flask`, `requests`, `flask-cors`, `gunicorn`; exposes `:5000` and starts `gunicorn backend.app:app`.
- **Procfile**: `web: gunicorn backend.app:app` for Render.com.

## API
- **Endpoint**: `GET /check?domain=<domain>`
- **Parameter**: `domain` (required). Missing parameter → `400 Bad Request`.
- **Typical responses**

| HTTP | found | message                                                                   |
| ---: | :---: | ------------------------------------------------------------------------- |
| 200  | true  | Domain associated with M365; redirect URL returned when available.        |
| 200  | true  | Domain replied 200 but without URL / invalid JSON.                        |
| 404  | false | Domain is not associated with Microsoft 365.                              |
| 400  | null  | Protocol error (missing `Protocol=Autodiscoverv1`) or malformed request.  |
| 500  | null  | Internal error / timeout toward Autodiscover.                             |

**Example**
```bash
curl "http://localhost:5000/check?domain=contoso.com"
```
```json
{
  "domain": "contoso.com",
  "status": 200,
  "found": true,
  "message": "Domain is associated with Microsoft 365. Redirect URL: https://outlook.office365.com/autodiscover/autodiscover.xml"
}
```

## Quick start
### Docker (recommended)
```bash
docker pull ghcr.io/gioxx/m365-tenant-checker:latest
docker run -p 5000:5000 ghcr.io/gioxx/m365-tenant-checker:latest
```
Open `http://localhost:5000` for the UI, or call `/check`.

### Docker Compose (single service)
`compose.yaml`
```yaml
services:
  m365-tenant-checker:
    image: ghcr.io/gioxx/m365-tenant-checker:latest
    ports:
      - "5000:5000"
    restart: unless-stopped
```
Run it:
```bash
docker compose up -d
```
Browse `http://localhost:5000`.

### Local run (no Docker)
```bash
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
gunicorn backend.app:app --bind 0.0.0.0:5000
# dev alternative: flask --app backend.app run --host 0.0.0.0 --port 5000
```

### Render.com
1. Create a **Web Service**.
2. Connect the GitHub repo.
3. Set: Build Command empty; Start Command `gunicorn backend.app:app`; Runtime Python 3; Instance Type *Free*.
4. Deploy.

## Repository structure
```
m365-tenant-checker/
├── backend/
│   ├── app.py              # /check endpoint and static serving
│   └── requirements.txt
├── frontend/
│   └── index.html          # Minimal UI with theme toggle
├── Dockerfile              # Image published to ghcr.io
├── Procfile                # Render.com startup
├── README.md / README-IT.md
└── LICENSE
```

## Operational notes
- No authentication or rate limiting: place behind a reverse proxy if exposed publicly.
- Backend uses `requests` with a 5s timeout; network issues return `500`.
- HTML is served directly by Flask (`/`), so no separate static server is required.
- Dockerfile currently uses Python **3.15 slim**; pin to an LTS version if needed for production.
