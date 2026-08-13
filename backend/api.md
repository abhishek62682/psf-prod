# API Documentation — NGO Donation Verification Platform

All endpoints, grouped by module. 🔒 = requires `Authorization: Bearer <jwt>`. Base URL: `http://localhost:8000`.

For request/response bodies and a step-by-step manual test walkthrough, see [api-test.md](api-test.md).

---

## auth
→ POST /api/auth/login — Login with email + password, generates a one-time OTP
→ POST /api/auth/verify-otp — Verify OTP and get a JWT + admin profile
→ POST /api/auth/forgot-password — Emails a password reset link. Always returns the same generic success message, whether or not the email matches an account (prevents account enumeration)
→ POST /api/auth/reset-password — Reset a password using the token from the reset link (`token`, `password`; token expires after 1 hour and is single-use)
→ GET /api/auth/me 🔒 — Get the currently authenticated admin
→ POST /api/auth/logout 🔒 — Logout (client discards the JWT)

## profile
→ GET /api/profile 🔒 — Get the authenticated admin's profile
→ PUT /api/profile 🔒 — Update name / email / avatar
→ PUT /api/profile/password 🔒 — Change password
→ POST /api/profile/avatar 🔒 — Upload an image and set it as the admin's avatar

## campaign
→ GET /api/campaigns — List campaigns (paginated, searchable, featured/status filterable; active only by default; no payment details or donor info)
→ GET /api/campaigns/:id — Get one campaign's details only (no payment account, no donors — use the endpoints below for those)
→ GET /api/campaigns/:id/donations — All verified donations for one campaign (paginated, searchable by donor name)
→ GET /api/campaigns/options — Minimal {_id, title} list for dropdowns/select boxes (active campaigns only, by default)
→ GET /api/campaigns/admin 🔒 — Active campaigns by default; `?status=` also accepts `draft`/`paused`/`completed`, `deleted` (soft-deleted campaigns, any status), or `all` (every non-deleted campaign, any status). Each campaign additionally carries a `meta: {progress, totalDonations, pendingDonations, verifiedDonations, rejectedDonations}` object
→ POST /api/campaigns 🔒 — Create a campaign
→ PATCH /api/campaigns/:id 🔒 — Update a campaign (including status)
→ DELETE /api/campaigns/:id 🔒 — Soft-delete a campaign (`isDeleted: true`; status is left untouched — archiving is an admin action, not a status)

Campaign statuses: `draft`, `active`, `paused`, `completed`. (`archived` is not a status — soft-delete via `isDeleted` instead.)

**Auto-completion**: an active campaign is flipped to `completed` automatically once its end date passes or its raised amount reaches its goal — whichever happens first. The goal-reached case is applied immediately when a donation is verified (`donationController.verifyDonation`); a daily cron job at 12:00 AM (`campaignCron.js`) catches end dates passing with no donation involved. `POST /api/donations` only accepts donations for `status: "active"` campaigns, so a completed campaign stops accepting new payments the moment it completes.

## donation
→ POST /api/donations — Submit a donation with a payment screenshot (rejected with 409 if the campaign's goal is already met). Accepts `is80GApplicable` (boolean, default `false`) and `panNumber` (required + validated against `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` when `is80GApplicable=true`, normalized to uppercase). If the same `transactionId` already exists for the campaign with status `pending`/`verified`, the request is rejected with 409; if it exists with status `rejected`, that record is reused and moved back to `pending` for re-review
→ GET /api/donations — List verified donations platform-wide (paginated, searchable by donor or campaign name), plus overall stats (totalSupporters, totalRaised, totalCampaigns)
→ GET /api/donations/recents — Latest 30 verified donations across all campaigns, newest first
→ GET /api/donations/admin 🔒 — List every donation regardless of status (filterable by status/campaign/search/`is80GApplicable=true|false`) — the verify/reject workflow. When `campaignId` is given, also returns `stats: {pending, verified, rejected, total}` for that campaign (independent of the status/search filters). Includes `is80GApplicable` and `panNumber` per donation
→ GET /api/donations/:id 🔒 — Get one donation + its verification audit log (includes `is80GApplicable`/`panNumber`)
→ PATCH /api/donations/:id/verify 🔒 — Verify a pending donation; emails the donor once the status update succeeds
→ PATCH /api/donations/:id/reject 🔒 — Reject a pending donation; emails the donor once the status update succeeds

## career
→ GET /api/careers — List active, non-deleted career postings, newest first
→ GET /api/careers/admin 🔒 — Every non-deleted posting, any status (active/closed included)
→ GET /api/careers/:id 🔒 — Get one posting (used by the edit form)
→ POST /api/careers 🔒 — Create a posting
→ PATCH /api/careers/:id 🔒 — Update a posting (including status, to hide/show without deleting)
→ DELETE /api/careers/:id 🔒 — Soft-delete a posting (`isDeleted: true`)

Career statuses: `active`, `closed`. Employment types: `full-time`, `part-time`, `internship`. Work modes: `on-site`, `hybrid`, `remote`.
No applications are stored — "Apply Now" on the public site is a plain `mailto:` link, not a submission form.

## contact
→ POST /api/contact — Submit a contact form message (fullName, email, phone, subject, message, interest)
→ GET /api/contact 🔒 — List submitted messages (paginated, filterable by status/interest, searchable)
→ GET /api/contact/:id 🔒 — Get one message in full
→ PATCH /api/contact/:id 🔒 — Update triage status (new / read / responded)
→ DELETE /api/contact/:id 🔒 — Delete a message

## dashboard
→ GET /api/dashboard 🔒 — Aggregate stats summary (totals, today's activity)
→ GET /api/dashboard/recent-donors 🔒 — Paginated list of verified donors

## upload
→ POST /api/uploads/image 🔒 — Upload a single image (thumbnail, gallery, or qrcode)
→ POST /api/uploads/images 🔒 — Upload multiple campaign gallery images (max 10)

## paymentReceiving
→ GET /api/payment-receiving — Get the current default payment receiving account (single object, not a list — only one account is used today)
→ GET /api/payment-receiving/audit-logs 🔒 — Full change history across all payment receiving accounts, newest first (filterable by `action`/`accountId`, searchable by the admin's name/email)
→ GET /api/payment-receiving/:id 🔒 — Get a specific payment receiving account by id (admin/internal use)
→ POST /api/payment-receiving 🔒 — Create a payment receiving account
→ PATCH /api/payment-receiving/:id 🔒 — Update a payment receiving account
→ DELETE /api/payment-receiving/:id/qr-code 🔒 — Remove only the QR code from an account, leaving the rest untouched
→ DELETE /api/payment-receiving/:id 🔒 — Soft-delete a payment receiving account (blocked if a campaign still uses it)

Every create/update/delete/QR-removal on a payment receiving account is recorded in an audit log entry: who changed it (`changedBy`), which fields changed (`changes: [{field, oldValue, newValue}]`), and when (`createdAt`).

## health
→ GET /api/health — Health check
