# Admin Shell

React + TypeScript + Vite admin panel. **Only login/logout are wired to a
real backend right now** — everything else in the dashboard is static UI
with mock data, on purpose, until the rest of the backend is ready.

## What's real

- **Login → OTP → dashboard** — talks to your NGO donation-platform backend
  (`src/config/api/auth.api.ts`), matching `README.md` / `api-test.md`
  exactly:
  - `POST /api/auth/login` → triggers OTP
  - `POST /api/auth/verify-otp` → returns `{ token, user }`
  - `POST /api/auth/logout` → called when you click "Log out"
- Auth state lives in `src/config/store/auth.tsx` (zustand + persisted
  cookie token). It's a flat store — `isAuthenticated`, `user`,
  `pendingEmail` are all top-level fields that are never `null` in a way
  that breaks destructuring. That was the root cause of the crash you hit
  before (`Cannot destructure property 'isAuthenticated' of ... null`) —
  the old code did `const { isAuthenticated } = useAuthStore(s => s.user)`,
  and `user` starts out `null`. Every place that pattern existed
  (`AuthLayout`, `DashboardLayout`, the OTP page) has been rewritten to
  read flat booleans instead.

## What's static (mock data)

- **Dashboard home** (`src/pages/dashboard-pages/HomePage.tsx`) — stat
  cards, chart, and "Recent Donors" table all render a hardcoded
  `MOCK_STATS` constant. `src/config/api/dashboard.api.ts` already matches
  the real `GET /api/dashboard` response shape from your README — swap
  the mock for `useQuery({ queryFn: getStats })` when you're ready.
- **Profile page** — shows your real logged-in name/email, but "Save
  Changes" / "Update Password" just show a toast and update local state.
  `src/config/api/profile.api.ts` matches `GET/PUT /api/profile` and
  `PUT /api/profile/password` — call those instead of the toast stubs
  when you want it to persist.

## Removed

The old multi-page forgot-password / reset-password / OTP-reset flow is
gone — your backend doesn't expose those endpoints, and it was the most
tangled part of the old login flow. Login is now a clean two-step:
email+password → OTP → dashboard.

## Getting started

```bash
npm install
# .env.development already points at http://localhost:8000/api
# (matches api-test.md's base URL) — change it if your backend runs elsewhere
npm run dev
```

Run your backend (`npm run seed:admin && npm run dev` in the backend repo)
first, then log in with the seeded admin credentials.

## Next steps

1. Wire `HomePage.tsx` to `getStats()` once `/api/dashboard` has real data
   behind it.
2. Wire the Profile page to `updateProfile()` / `changePassword()`.
3. Add campaign/donation pages under `src/pages/`, register routes in
   `src/config/router.tsx`, add sidebar links in `src/components/app-sidebar.tsx`.
