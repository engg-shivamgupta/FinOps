# FinOps Frontend

React + Vite dashboard for the existing **FinOps FastAPI backend** (JWT auth, role-based access, records, dashboard, insights, user management). It talks to the real API only: no mock data, no invented endpoints.

> **Verification status:** this project was written without network access, so `npm install`, `npm run build`, `npm test` and a live run against the backend have **not** been executed. See "Verification" below for what was and wasn't checked.

## Prerequisites
- Node.js 18.18+ (22 LTS recommended) and npm
- The FinOps backend running (Docker Compose recommended) with the CORS patch below applied

## 1. Backend setup (separate from the frontend)
```bash
cd FinOps
# create FinOps/.env (the repo has no template). Minimum: SECRET_KEY=<long random string>
# Docker Compose also needs DB_HOST=db (the default); other DB_* values default to the compose file.
git apply /path/to/finops-frontend/backend-changes/cors.patch   # or: patch -p1 < cors.patch
docker compose up --build            # MySQL + API on http://localhost:8000
docker compose exec api python seed.py   # demo users + 100 random records (optional: --count 500)
```
The backend `.env` holds secrets (`SECRET_KEY`, DB credentials). Never copy them into the frontend `.env`: every `VITE_*` variable is bundled into public browser code.

The seed script creates **development/demo** accounts (replace them before any real deployment):

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Analyst | `analyst` | `analyst123` |
| Viewer | `viewer` | `viewer123` |

### CORS (required)
The backend ships without CORS middleware, so a browser app on `:5173` is blocked. `backend-changes/cors.patch` adds `CORSMiddleware` with an explicit origin list (`CORS_ORIGINS`, default `http://localhost:5173,http://127.0.0.1:5173`), no wildcard, `allow_credentials=False` (the API uses Bearer tokens, not cookies). For another origin set e.g. `CORS_ORIGINS=https://finops.example.com` in the backend `.env`. The patch was checked to apply cleanly to the supplied source and to compile; nothing else in the backend changes.

## 2. Frontend setup
```bash
cd finops-frontend
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8000
npm run dev              # http://localhost:5173
```
Other scripts: `npm run build`, `npm run preview`, `npm test` (Vitest, utility/validation tests).

## What is integrated
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Session | `GET /api/users/me` (verifies a restored token), `GET /api/dashboard/roles` (only used to refresh permissions if a restored session's role changed) |
| Dashboard | `GET /api/dashboard/summary` |
| Records | `GET/POST /api/records/`, `GET/PUT/DELETE /api/records/{id}` |
| Insights | `GET /api/dashboard/insights` |
| Users | `GET /api/users/`, `GET/PATCH/DELETE /api/users/{id}` |

Permissions come from the `interface` map returned at login (`usePermission('can_create_record')`, `<PermissionGuard>`, `PermissionRoute`). Hiding a control is UX only; the backend enforces access.

## Design decisions that follow the backend contract
- **Trailing slashes** on `/api/records/` and `/api/users/` are intentional (FastAPI otherwise 307-redirects, which breaks cross-origin preflights).
- **Pagination** has no total: the API returns a bare list. "Next" is enabled when a page comes back full, so the last page can occasionally be empty when the total is an exact multiple of the page size.
- **Dashboard** labels: totals are system-wide (not per user); the category chart combines income and expenses; trends are populated months only (max 12); recent activity is the latest 10. The fourth card shows distinct categories with activity, because no total transaction count exists in `/summary`.
- **Registration** always sends `role: "viewer"`, with no role selector. It does not log in automatically; it redirects to `/login`.
- **Errors**: one Axios instance; 401 on an authenticated request ends the session once (no retry loop); a plain 403 keeps the session and shows the message; the specific 403 "User account is inactive" ends the session with a notice; network/timeout errors show a retry. No automatic retries of POST/PUT/DELETE. Login/register skip the token interceptor, so a wrong password never looks like an expired session.
- **User management**: you can't deactivate or change the role of your own account from the UI (the backend has no safeguard). There is no user-creation or password UI because no endpoint supports it.

## Token storage trade-off
The JWT, role and permissions are kept in `sessionStorage`: cleared when the tab closes, but readable by any script on the origin, so **an XSS bug can steal the token**. There's no "remember me" for that reason. The backend has no refresh endpoint; tokens last 60 minutes (default) and then the user must sign in again. A more robust design is an `HttpOnly; Secure; SameSite` cookie issued by the backend, with CSRF protection, which would need backend changes.

## Backend issues found (not changed, recommended fixes)
1. **Public registration accepts `role`**, so anyone can POST `"role": "admin"`. Force `viewer` server-side (drop `role` from `UserCreate`). The frontend never sends anything else, but that isn't a security boundary.
2. **Data is not scoped per user**: all dashboard and record queries cover every non-deleted record.
3. **Unstable pagination**: records are ordered by `date` only; rows sharing a date can repeat or vanish across pages. Add `id` as a tie-breaker and ideally return a total.
4. **No safeguards on self-demotion/deactivation** of the last admin.
5. **Amounts are `Float`**: use `Numeric(12, 2)` to avoid rounding drift in sums.
6. `email` is typed `str` (not `EmailStr`), so the server doesn't validate email format; the client does.
7. Role changes only affect UI permissions after the next login/session restore (the server still enforces the current role on every request).

## Production build and deployment
`npm run build` outputs static files to `dist/`. Set `VITE_API_BASE_URL` at build time to the public API URL, serve over HTTPS, and add a SPA fallback (all paths → `index.html`), e.g. nginx `try_files $uri /index.html;`. Replace the demo credentials, set a strong `SECRET_KEY`, and restrict `CORS_ORIGINS` to the real frontend origin.

## Troubleshooting
- *"Can't reach the FinOps API…"*: backend not running, wrong `VITE_API_BASE_URL` (restart `npm run dev` after editing `.env`), or the CORS patch isn't applied / origin isn't listed.
- *Redirected to login with "session expired"*: token older than 60 minutes or the user was deactivated.
- *Backend fails to start*: `SECRET_KEY` missing from the backend `.env`.

## Verification
Checked in the authoring environment (no network): backend source fully read; CORS patch applied to a pristine copy and byte-compiled; pure utility modules (currency, dates, category labels, error parsing) smoke-tested under Node.
**Not run:** dependency install, Vite build, Vitest, the UI itself, any request against a live backend, role walk-throughs, mobile layout checks. Run `npm install && npm run build && npm test` first, then walk through the checklist: log in as each demo user, create/edit/delete a record (Admin), confirm Viewer has no Insights and no mutation buttons, filter/paginate, edit/deactivate a user, and let a token expire.
