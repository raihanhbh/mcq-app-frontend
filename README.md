# MCQ App Frontend

Mobile-first React PWA for AI-generated multiple-choice knowledge tests. Integrates with Firebase Authentication and the `mcq-app-backend` REST API (see [`API.md`](API.md)).

## Tech Stack

- **Vite + React 19** — SPA with route-level code splitting
- **React Router 7** — client-side routing with role guards
- **TanStack Query** — server state and caching
- **Firebase Auth** — email/password login; ID token sent as Bearer on API calls
- **vite-plugin-pwa** — installable PWA with service worker
- **Firebase Hosting** — static deploy via GitHub Actions (WIF)

## Local Development

### Prerequisites

- Node.js 22+
- A running `mcq-app-backend` instance
- A Firebase project with Email/Password auth enabled

### Setup

```bash
cp .env.example .env
# Fill in VITE_API_BASE_URL and VITE_FIREBASE_* values
npm install
npm run dev
```

Open http://localhost:5173

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL (e.g. `https://api.example.com`) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `{projectId}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase / GCP project ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |

These are injected at **build time** (Vite `import.meta.env`). Never commit secrets — only the public Firebase web config belongs in the client.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and production build → `dist/` |
| `npm run preview` | Preview production build locally |

## Deployment (Firebase Hosting)

**Production URLs**

| URL | Notes |
|-----|--------|
| **https://learnbymcq.xyz** | Custom domain (primary, after DNS + Terraform apply) |
| https://www.learnbymcq.xyz | Redirects to apex |
| https://topicmastery-core-2026.web.app | Firebase default URL |

Deploys automatically on push to `main` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

- **Pull requests to `main`:** build only (validates TypeScript + Vite production build)
- **Push to `main`:** build → deploy to Firebase Hosting → smoke check
- **Auth:** Workload Identity Federation (no JSON key); dedicated SA `topicmastery-github-frontend@topicmastery-core-2026.iam.gserviceaccount.com`

### One-time infra setup (mcq-app-infra)

The frontend deploy SA and WIF binding are provisioned by Terraform in `mcq-app-infra`:

```bash
cd mcq-app-infra
terraform apply   # creates topicmastery-github-frontend SA + WIF repo binding
terraform output -raw github_frontend_service_account_email
terraform output -raw workload_identity_provider
```

Ensure `github_frontend_repository` in `terraform.tfvars` matches this repo (default: `raihanhbh/mcq-app-frontend`).

### Custom domain (`learnbymcq.xyz`)

Provisioned in `mcq-app-infra` via `google_firebase_hosting_custom_domain` and Firebase Auth authorized domains.

```bash
cd mcq-app-infra
# Ensure terraform.tfvars includes:
#   frontend_custom_domain        = "learnbymcq.xyz"
#   frontend_www_redirect_to_apex = true
terraform apply

# DNS records to add at your domain registrar (learnbymcq.xyz):
terraform output -json frontend_custom_domain_dns_records
```

At your **domain registrar** (where you bought `learnbymcq.xyz`), create the DNS records from the Terraform output. Typical Firebase Hosting setup:

- **Apex (`learnbymcq.xyz`)** — A records to Firebase Hosting IPs (or ALIAS/ANAME if supported)
- **`www`** — CNAME to your Firebase Hosting target (or use the www redirect resource; Terraform configures `www.learnbymcq.xyz` → apex)

SSL certificates are provisioned automatically by Firebase after DNS verifies (can take up to 24 hours).

After DNS propagates, open **https://learnbymcq.xyz** — the same build deployed to `*.web.app` is served on the custom domain. No extra frontend deploy step is required.

### GitHub repository configuration

**Secrets** (Settings → Secrets and variables → Actions → Secrets) — required for the build step:

| Secret | Description |
|--------|-------------|
| `VITE_API_BASE_URL` | Production backend URL |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

**Variables** (optional overrides; workflow has defaults matching infra outputs):

| Variable | Default / source |
|----------|------------------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `terraform output -raw workload_identity_provider` |
| `GCP_SERVICE_ACCOUNT` | `terraform output -raw github_frontend_service_account_email` |

**Environment:** create a `production` environment in GitHub (optional but recommended) — the deploy job uses `environment: production`.

### Manual deploy

```bash
npm run build
npx firebase-tools deploy --only hosting --project topicmastery-core-2026
```

## Project Structure

```
src/
├── api/           # REST client + endpoint modules
├── auth/          # Firebase init + AuthProvider
├── components/    # UI, test player, admin widgets
├── hooks/         # useTestPlayer, useDerivedTestStats
├── layouts/       # AppShell, PublicLayout
├── pages/         # Route pages (+ admin/)
├── routes/        # Router, ProtectedRoute, AdminRoute
└── styles/        # Design tokens + global CSS
```

## API Contract

All backend endpoints are documented in [`API.md`](API.md). The frontend does not access any database directly.

## Roles

- **Learner** — tests, profile
- **Admin** — all learner features plus `/admin/*` pages

Role is fetched once from `GET /api/v1/me` after login and cached for the session.