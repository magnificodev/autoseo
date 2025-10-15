# Autoseo

SEO automation system with FastAPI backend, Next.js dashboard, Postgres/Redis, and WordPress integration. Deployed via GitHub Actions to a staging server.

## Stack

-   Backend: FastAPI, SQLAlchemy, Alembic, JWT (python-jose), Passlib (pbkdf2_sha256)
-   Frontend: Next.js 14 (minimal stub in Phase 0)
-   Infra: Docker Compose (Postgres, Redis, Nginx, Backend, Dashboard)
-   CI: GitHub Actions (workflow: CI)
-   CD: GitHub Actions (workflow: CD (Staging 40.82.144.18))

## Quickstart (Local)

1. Environment

```bash
cp .env.example .env
```

2. Run

```bash
docker compose up --build
```

3. Verify

-   Backend health: http://localhost:8000/health
-   Dashboard: http://localhost:3000
-   Nginx proxy: http://localhost/health → backend, `/` → dashboard

## Staging Deployment

-   Server: 40.82.144.18
-   Workflow: “CD (Staging 40.82.144.18)”
-   Triggers: push to `main` and manual (workflow_dispatch)
-   After containers up: Alembic auto-runs `upgrade head`
-   Verify:
    -   http://40.82.144.18/health
    -   http://40.82.144.18/

## Environment (.env)

```
PROJECT_NAME=autoseo

# Backend
BACKEND_PORT=8000
BACKEND_CORS_ORIGINS=http://localhost:3000
JWT_SECRET=change-me
JWT_EXPIRE_MIN=60

# Dashboard
DASHBOARD_PORT=3000
NEXT_PUBLIC_API_BASE=http://localhost:8000

# Postgres
POSTGRES_DB=autoseo
POSTGRES_USER=autoseo
POSTGRES_PASSWORD=autoseo
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379
```

## API Endpoints (Phase 1)

-   Health: `GET /health`
-   Auth:
    -   `POST /auth/register?email=...&password=...`
    -   `POST /auth/login` (x-www-form-urlencoded: username=email, password)
    -   Response: `{ access_token, token_type }`
-   Protected (Authorization: Bearer <token>):
    -   Sites: `GET/POST /sites/`
    -   Keywords: `GET/POST /keywords/`
    -   Content: `GET/POST /content/` (supports Unicode)

## Testing

-   Local (backend only):

```bash
cd backend
pip install -r requirements.txt pytest fastapi[all]
pytest -q
```

-   CI Workflow “CI” runs pytest with SQLite (`DATABASE_URL=sqlite:///./test.db`).

## Notes & Troubleshooting

-   Unicode JSON: Use `Content-Type: application/json; charset=utf-8`. In curl, prefer `--data-binary @file.json` for Vietnamese text.
-   Login uses OAuth2 form field name `username` but the value is your email.
-   First run creates tables automatically; Alembic manages schema in CD.

## Project Structure (short)

```
backend/
  src/api/main.py
  src/api/routes/{auth,sites,keywords,content}.py
  src/api/deps/auth.py
  src/database/{models.py,session.py}
  alembic/{env.py,versions/0001_init.py}
dashboard/
  app/login/page.tsx
docker-compose.yml
nginx.conf
.env.example
```
