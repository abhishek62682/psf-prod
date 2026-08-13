# API Testing Guide — NGO Donation Verification Platform

Step-by-step guide to test every endpoint in the correct order and catch bugs early.

**Base URL:** `http://localhost:8000/api`

**Golden rule:** Test in the order written below. Later tests depend on data created in earlier tests (token → payment account → images → campaign → donation → verify).

For the full request/response contract of every route, see [api.md](api.md).

---

## 0. Setup (one time)

```bash
cp .env.example .env     # fill MONGO_CONNECTION_STRING, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
                          # PAYMENT_UPI_ID or PAYMENT_ACCOUNT_NUMBER (for seed:payment)
npm install
npm run seed:admin       # creates the admin account
npm run seed:payment     # creates the default payment receiving account
npm run dev
```

✅ Console shows: `Connected to database successfully.` and `Listening on port: 8000`

**Health check first:**

| | |
|---|---|
| Method | GET |
| URL | `/api/health` |
| Auth | ❌ No |

Expected `200`:
```json
{ "success": true, "message": "Server is up and running." }
```

🐞 **If this fails** → server/port issue. Fix before testing anything else.

---

## 1. Authentication Flow

### 1.1 Login (get OTP)

| | |
|---|---|
| Method | POST |
| URL | `/api/auth/login` |
| Auth | ❌ No |
| Body | raw JSON |

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe@123"
}
```

Expected `200` (dev mode includes the OTP):
```json
{ "success": true, "message": "OTP generated successfully", "otp": "123456" }
```

**Bug checks:**
- Wrong password → `401` `"Invalid email or password."`
- Missing email → `400` Zod: `"Email is required."`
- Invalid email format (`"abc"`) → `400` `"A valid email is required."`
- Email with spaces/caps (`"  Admin@Example.COM "`) → should still work (Zod trims + lowercases)

### 1.2 Verify OTP (get token + user)

| | |
|---|---|
| Method | POST |
| URL | `/api/auth/verify-otp` |
| Auth | ❌ No |

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

Expected `200`:
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "6a72eac2b274ea767a4384d7",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN"
  }
}
```

📌 **COPY THE TOKEN.** Every 🔒 endpoint below needs header: `Authorization: Bearer <token>`

**Bug checks:**
- Wrong OTP → `401` `"Invalid or expired OTP."`
- OTP with letters (`"12a456"`) → `400` `"OTP must be 6 digits."`
- OTP older than ~5 min → `401` (expired — login again for fresh OTP)

### 1.3 Get current admin

| | |
|---|---|
| Method | GET |
| URL | `/api/auth/me` |
| Auth | 🔒 Yes |

Expected `200`: `data.user` with id, name, email, role, avatar.

**Bug checks:**
- No token → `401` `"Authorization token is required."`
- Garbage token (`Bearer abc123`) → `401` `"Token expired or invalid."`
- ⚠️ Response must NEVER contain `password` or `otpSecret` — if it does, that's a serious bug.

### 1.4 Logout

POST `/api/auth/logout` 🔒 → `200` `"Logged out successfully."`

---

## 2. Profile

### 2.1 Get profile
GET `/api/profile` 🔒 → `200` with admin data (again: no password/otpSecret in response).

### 2.2 Update profile
PUT `/api/profile` 🔒
```json
{ "name": "Ankit Singh" }
```
Expected `200` with updated name.

**Bug checks:**
- `{ "name": "A" }` → `400` `"Name must be at least 2 characters."`
- `{ "email": "not-an-email" }` → `400`

### 2.3 Update password
PUT `/api/profile/password` 🔒
```json
{ "currentPassword": "ChangeMe@123", "newPassword": "NewPass@456" }
```
Expected `200`. **Then re-test 1.1 login with the NEW password** — old password must now give `401`.

**Bug checks:**
- Wrong currentPassword → `401` `"Current password is incorrect."`
- newPassword `"short"` → `400` `"New password must be at least 8 characters."`

### 2.4 Upload avatar

| | |
|---|---|
| Method | POST |
| URL | `/api/profile/avatar` |
| Auth | 🔒 Yes |
| Body | form-data → key **`avatar`** (type: File) → jpg/png/webp |

Expected `201`:
```json
{ "success": true, "data": { "avatar": "/uploads/profile/1785920439894-524942735.png" } }
```

**Bug checks:**
- No file → `400` `"Avatar image is required."`
- `.txt`/`.pdf` file → `400` `"Only JPEG, PNG and WEBP images are allowed."`
- File > 5MB → `400`
- File lands in `public/uploads/profile/` (not `misc/` — that category no longer exists)
- GET `/api/auth/me` and GET `/api/profile` now show the new `avatar` URL
- Open the URL in browser → image renders

---

## 3. Payment Receiving Accounts

The default account was created by `npm run seed:payment` in step 0 — campaigns will auto-attach it. Only one account is surfaced publicly today (the default); the underlying model/CRUD already supports more, for later.

### 3.1 Get the default account (public)
GET `/api/payment-receiving` (no auth) → `200`, a single object (not an array) — your seeded account, `isDefault: true`. 📌 **Copy its `_id`.**

🐞 If no account has been seeded yet → `404` `"No payment receiving account is configured."`

### 3.2 Get by id (admin)
GET `/api/payment-receiving/:id` 🔒 → `200` with full details (`upiId`/`accountNumber`/etc).

🐞 No token → `401`. Unknown/invalid id → `404` / `400`.

### 3.3 Create a second account
POST `/api/payment-receiving` 🔒
```json
{
  "accountName": "Secondary Fund",
  "upiId": "secondary@upi",
  "isDefault": false
}
```
Expected `201`. 📌 **Copy its `_id` as `SECOND_ID`.**

**Bug checks:**
- Body with none of `qrCode`/`upiId`/`accountNumber` → `400` `"Provide at least one payment method..."`
- Missing `accountName` → `400`
- No token → `401`

### 3.4 Flip the default
PATCH `/api/payment-receiving/SECOND_ID` 🔒
```json
{ "isDefault": true }
```
Expected `200`, `isDefault: true`. Then GET `/api/payment-receiving` (3.1, public) → must now return `SECOND_ID`'s account instead of the original (only one default at a time, and the public endpoint always follows whichever account is currently default). **Flip it back** (`PATCH` the original account with `{ "isDefault": true }`) before continuing, so campaign creation keeps using the account you expect.

### 3.5 Delete blocked while in use
Create a campaign first (section 5), letting it auto-attach the default account — then:

DELETE `/api/payment-receiving/:id` 🔒 (the account that campaign is using) → expect `409` `"...still assigned to one or more campaigns."`

Delete `SECOND_ID` instead (unused) → expect `200`. Then GET `/api/payment-receiving/SECOND_ID` 🔒 → `404` (soft-deleted). GET `/api/payment-receiving` (public) is unaffected since it was never the default.

---

## 4. Uploads (campaign images)

### 4.1 Single image (thumbnail/cover)

| | |
|---|---|
| Method | POST |
| URL | `/api/uploads/image?type=thumbnail` |
| Auth | 🔒 Yes |
| Body | **form-data** → key `image` (type: File) → pick a jpg/png/webp |

Expected `201`:
```json
{ "success": true, "data": { "url": "/uploads/thumbnail/1785920439894-524942735.png", "type": "thumbnail" } }
```

📌 Copy the `url` — needed for campaign creation.

### 4.1b QR code image

Same endpoint, `?type=qrcode` → `201` with `url` under `/uploads/qrcode/`. This is the two-step flow the Payment Receiving admin page uses: upload here first, then `PATCH /api/payment-receiving/:id` with `{ "qrCode": "<that url>" }` to actually attach it to the account.

### 4.2 Multiple images (gallery)

| | |
|---|---|
| URL | `/api/uploads/images?type=gallery` |
| Body | form-data → key **`images`** (plural!) → select 2-3 files |

Expected `201` with `urls` array + `count`.

**Bug checks (do all of these):**
- No token → `401`
- Key `image` on `/images` route (or `images` on `/image`) → `400` `"Too many files or wrong field name..."`
- Upload a `.txt` or `.pdf` → `400` `"Only JPEG, PNG and WEBP images are allowed."`
- Upload a file > 5MB → `400` `"Image must be smaller than 5 MB."`
- 11+ files on `/images` → `400` max 10 error
- No `?type=` param, or `?type=misc`/`?type=../../etc` → `400` `"A valid upload type is required..."` — there is **no** fallback folder anymore. If a file lands anywhere on disk despite this, that's a critical bug.
- **Static serving:** open the returned URL in browser: `http://localhost:8000/uploads/thumbnail/<filename>` → image must render

---

## 5. Campaigns

### 5.1 Create campaign

POST `/api/campaigns` 🔒 — raw JSON (use YOUR uploaded URLs from step 4):
```json
{
  "title": "Education For Every Child",
  "shortDescription": "Support education for underprivileged children.",
  "description": "Full campaign description here.",
  "goalAmount": 1000000,
  "coverImage": "/uploads/thumbnail/PASTE-YOURS.png",
  "gallery": ["/uploads/gallery/PASTE-1.png", "/uploads/gallery/PASTE-2.png"],
  "startDate": "2026-08-05",
  "endDate": "2026-12-31",
  "isFeatured": true,
  "status": "active"
}
```

Note: no `paymentReceivingAccountId` given — it must auto-attach your seeded default account.

Expected `201` with campaign object, including `paymentReceivingAccountId` set to your default account's id. 📌 **Copy `_id`.**

**Bug checks:**
- Create the same campaign again (same title/slug) → `409` `"A campaign with this slug already exists."`
- No `slug` field → `201`, slug auto-generated from title
- `endDate` before `startDate` → `400` `"End date must be after start date."`
- `goalAmount: -5` or `"abc"` → `400`
- `status: "running"` (invalid) → `400` `"Invalid status."`
- Missing `title` → `400` with `field: "title"` in errors array
- 🐞 If section 3 doesn't have any account left (all soft-deleted), this must fail `400` `"No payment receiving account is configured..."` instead of crashing

### 5.2 List campaigns (public)
GET `/api/campaigns` (no auth) → `200`, only **active** non-deleted campaigns, each with `progress` field, pagination object.

Also test: `?search=education`, `?featured=true`, `?page=1&limit=5`.

### 5.3 Get by id — campaign details only (public)

GET `/api/campaigns/:id` → `200`:
```json
{
  "data": { "...": "...", "progress": 0 }
}
```
Campaign fields only — no `paymentReceivingAccount`, no `recentDonors`/donors of any kind, and no `paymentReceivingAccountId` field either. For payment details use `GET /api/payment-receiving/:id`; for donors use `GET /api/campaigns/:id/donations` (5.6).

🐞 Unknown/invalid id → `404`/`400` `"Campaign not found."` / `"Invalid id."`. There is no slug-based route anymore — `GET /api/campaigns/education-for-every-child` must now `400` (invalid ObjectId), not `200`.

### 5.4 Update campaign
PATCH `/api/campaigns/:id` 🔒
```json
{ "goalAmount": 2000000 }
```
Expected `200`. 🐞 Invalid id format → `400` `"Invalid id."` · Non-existent valid id → `404`. `PUT` on this route should now be `404` (route removed — method not allowed).

### 5.5 Update status (via the same PATCH — no dedicated route anymore)
PATCH `/api/campaigns/:id` 🔒
```json
{ "status": "paused" }
```
Then GET `/api/campaigns` → paused campaign must NOT appear in public list. Set back to `active` before continuing.

🐞 `PATCH /api/campaigns/:id/status` must now `404` — that route was removed in favor of the generic update above.

### 5.6 Campaign donations (public)
GET `/api/campaigns/:id/donations` → `200`, only **verified** donations for that one campaign, paginated. Empty for now — will fill after donation verify (section 6). Also test `?search=rahul` (donor name) once you have a verified donation.

🐞 Invalid/unknown campaign id → `400`/`404`, same as 5.3.

### 5.7 Admin campaign list
GET `/api/campaigns/admin` 🔒 → `200`, same shape as the public list (5.2) but includes **every status** — draft/paused/completed campaigns show up here even though draft/paused are invisible on the public list. Each campaign's `progress`/donation counts are nested under `meta`.

**Bug checks:**
- No token → `401`
- `?status=draft` → only draft campaigns
- A `paused` campaign (from 5.5) → visible here, NOT visible on GET `/api/campaigns`

### 5.8 Campaign options (public, for dropdowns)
GET `/api/campaigns/options` (no auth) → `200`:
```json
{ "data": [ { "_id": "...", "title": "Education For Every Child" } ] }
```
Only `_id` and `title` — no `goalAmount`, `raisedAmount`, `status`, etc. Active campaigns only by default; test `?status=draft` to confirm it also filters like the main list.

---

## 6. Donations (the core flow)

### 6.1 Submit donation (public, form-data)

| | |
|---|---|
| Method | POST |
| URL | `/api/donations` |
| Auth | ❌ No |
| Body | **form-data** |

| Key | Type | Value |
|---|---|---|
| campaignId | Text | paste campaign `_id` |
| name | Text | Rahul Sharma |
| email | Text | rahul@example.com |
| phone | Text | 9876543210 |
| amount | Text | 1000 |
| transactionId | Text | UPI123456789 |
| paymentDate | Text | 2026-08-05 |
| message | Text | Happy to help! |
| paymentScreenshot | **File** | any jpg/png |

Expected `201` `"Donation submitted successfully."`

**Bug checks:**
- Same `transactionId` again → `409` `"...already been submitted."`
- No screenshot file → `400` `"Payment screenshot is required."`
- `amount: "abc"` → `400` · `amount: -100` → `400`
- Invalid `campaignId` (`"123"`) → `400` `"Invalid id."`
- Pause the campaign (5.5), then submit → `404` `"...not accepting donations."` — un-pause after
- Check disk: file must be in `public/uploads/screenshot/` folder
- 🐞 **Goal already met**: PATCH the campaign's `goalAmount` down to below its current `raisedAmount`, then submit → `409` `"...already reached its funding goal..."`. Restore `goalAmount` afterward. Note `raisedAmount` only changes on verify, not on submit — a pile of *pending* donations doesn't trigger this, only verified ones do.

### 6.2 Admin: list donations (all statuses)
GET `/api/donations/admin?status=pending` 🔒 → your donation appears with populated campaign title/slug. 📌 **Copy donation `_id`.** This is the admin management view — it shows every status (`pending`/`verified`/`rejected`), unlike public `GET /api/donations` (6.2a below) which only shows verified ones.

Also test filters: `?search=rahul` (matches name/email/transactionId), `?campaignId=<id>`, `?page=1&limit=5`.

🐞 No token → `401`.

### 6.2b Admin: campaign-scoped stats
GET `/api/donations/admin?campaignId=<id>&limit=1` 🔒 → response now also includes `data.stats: { pending, verified, rejected, total }` for that campaign — always the full breakdown regardless of `?status=`/`?search=` on the list itself. Omit `campaignId` → `stats` is absent.

### 6.2a Public: list verified donations + stats
GET `/api/donations` (no auth) → at this point (donation still `pending`, not verified yet) it should return an **empty** `donations` array and `stats.totalSupporters: 0` — pending donations must NOT appear here. Come back and re-run this after 6.4 (verify) — the donation should then appear and stats should update.

```json
{
  "data": {
    "stats": { "totalSupporters": 0, "totalRaised": 0, "totalCampaigns": 0 },
    "donations": [],
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

Also test `?search=rahul` (matches donor name OR campaign title) and `?search=education` (campaign name) after verifying — both should find the same donation.

🐞 `stats` must stay constant regardless of `?search=`/`?page=` — it always reflects *all* verified donations, not just the filtered/paginated page.

### 6.2b Public: recent donations
GET `/api/donations/recents` (no auth) → `200`, array of up to 30 latest **verified** donations, newest first. Empty until 6.4.

### 6.3 Admin: donation details
GET `/api/donations/:id` 🔒 → full details + `paymentScreenshot` URL (open it in browser — must render) + `auditLog` with one `"submitted"` entry.

### 6.4 Verify donation ⭐ (most important test)

PATCH `/api/donations/:id/verify` 🔒
```json
{ "remarks": "Payment verified successfully." }
```

Expected `200` with `status: "verified"`, `verifiedAt`, `verifiedBy`.

**Now check the side-effects (this is where money bugs hide):**
1. GET `/api/campaigns/:id` (5.3) → `data.raisedAmount: 1000`, `totalDonors: 1`, `progress` updated ✅ (campaign fields only, no donors here)
2. GET `/api/campaigns/:id/donations` (5.6) → Rahul Sharma now appears ✅
3. GET `/api/donations` (6.2a, public) → Rahul Sharma now appears, `stats.totalSupporters: 1`, `stats.totalRaised: 1000`, `stats.totalCampaigns: 1` ✅
4. GET `/api/donations/recents` (6.2b) → Rahul Sharma appears at the top ✅
5. GET `/api/donations/:id` → auditLog now has `"verified"` entry with admin name ✅
6. **CRITICAL — verify the SAME donation again** → must be `409` `"...already been processed."` and `raisedAmount` must STAY `1000` (not 2000). If it double-counts, that's a money bug.

### 6.5 Reject donation

Submit a 2nd donation (new transactionId!), then:

PATCH `/api/donations/:id/reject` 🔒
```json
{ "reason": "Screenshot is unclear." }
```

Expected `200`, `status: "rejected"`.

**Bug checks:**
- `raisedAmount` must NOT change after reject
- Empty reason `{}` → `400` `"Rejection reason is required."`
- Reject an already-verified donation → `409`

---

## 7. Contact Messages

### 7.1 Submit a message (public)

| | |
|---|---|
| Method | POST |
| URL | `/api/contact` |
| Auth | ❌ No |
| Body | raw JSON |

```json
{
  "fullName": "Priya Verma",
  "email": "priya@example.com",
  "phone": "9876543210",
  "subject": "Volunteering inquiry",
  "message": "I'd like to know how I can help.",
  "interest": "volunteer"
}
```
Expected `201` `"Message submitted successfully."` `interest` is single-select — one of `volunteer` / `partner` / `career` — and optional; `phone` is also optional.

**Bug checks:**
- Missing `fullName`/`email`/`subject`/`message` → `400` with the relevant `field` in errors
- `interest: "donor"` (not a valid option) → `400` `"Invalid interest."`
- Omit `phone` and `interest` entirely → still `201`

### 7.2 Admin: list messages
GET `/api/contact?status=new` 🔒 → your message appears. 📌 **Copy its `_id`.**

Also test: `?interest=volunteer`, `?search=priya`, `?page=1&limit=10`.

🐞 No token → `401`.

### 7.3 Admin: get one message
GET `/api/contact/:id` 🔒 → `200` with full details, `status: "new"`.

### 7.4 Admin: update triage status
PATCH `/api/contact/:id` 🔒
```json
{ "status": "read" }
```
Expected `200`, `status: "read"`. Then GET `/api/contact?status=new` (7.2) → the message no longer appears there; GET `/api/contact?status=read` → it does.

🐞 `{ "status": "closed" }` (invalid) → `400` `"Invalid status."`

### 7.5 Admin: delete message
DELETE `/api/contact/:id` 🔒 → `200`. Then GET `/api/contact/:id` → `404` (hard delete, not soft — nothing else references contact messages).

**Bug checks:**
- No token → `401`
- Rate limit: hit `POST /api/contact` 21+ times in an hour → `429` `"Too many messages submitted..."`

---

## 8. Dashboard

GET `/api/dashboard` 🔒 → verify the numbers match reality:
```json
{
  "totalCampaigns": 1,
  "activeCampaigns": 1,
  "pendingDonations": 0,
  "verifiedDonations": 1,
  "totalDonationAmount": 1000,
  "todayDonations": 2,
  "recentDonors": [ ... ]
}
```

🐞 If `totalDonationAmount` ≠ sum of verified amounts → aggregation bug.

GET `/api/dashboard/recent-donors?page=1&limit=10` 🔒 → paginated verified donors.

---

## 9. Delete & Edge Cases

### 9.1 Soft delete campaign
DELETE `/api/campaigns/:id` 🔒 → `200`. Then:
- GET `/api/campaigns` → gone from public list ✅
- GET `/api/campaigns/:id` → `404` ✅
- Data still in MongoDB with `isDeleted: true` (check Compass) ✅
- Its `paymentReceivingAccountId` account should now be deletable (section 3.5) since no active campaign references it anymore

### 9.2 General edge cases
- Unknown route: GET `/api/banana` → `404` `"Route not found."`
- Rate limit: hit `/api/auth/login` 11 times fast → `429` `"Too many login attempts..."`
- Malformed JSON body (delete a comma) → error response, server must NOT crash
- NoSQL injection: login with `{ "email": { "$gt": "" }, "password": "x" }` → must be `400`/`401`, never `200`

---

## 10. Quick Checklist

| # | Test | Pass? |
|---|---|---|
| 1 | Health check 200 | ☐ |
| 2 | Login → OTP → token + user object | ☐ |
| 3 | Protected route without token → 401 | ☐ |
| 4 | No password/otpSecret in any response | ☐ |
| 5 | Avatar upload → profile/ folder, avatar reflected on /auth/me | ☐ |
| 6 | Payment account seeded, isDefault exclusivity works, delete blocked while in use (409) | ☐ |
| 7 | Single upload → thumbnail/ folder | ☐ |
| 8 | Multi upload (key `images`) → gallery/ folder | ☐ |
| 9 | .txt / >5MB / 11 files / missing type all rejected (no misc fallback) | ☐ |
| 10 | Uploaded URLs open in browser | ☐ |
| 11 | Campaign created without paymentReceivingAccountId → auto-attaches default | ☐ |
| 12 | Duplicate slug → 409 | ☐ |
| 13 | endDate < startDate → 400 | ☐ |
| 14 | GET /api/campaigns/:id returns campaign fields only — no paymentReceivingAccount, no recentDonors | ☐ |
| 15 | Old routes gone: PUT /campaigns/:id, GET /campaigns/:slug, /:id/status, /:slug/stats, /:slug/recent-donors all 404 | ☐ |
| 16 | GET /api/campaigns/admin (🔒) shows all statuses; public list only shows active | ☐ |
| 17 | GET /api/campaigns/:id/donations returns only verified donations for that campaign | ☐ |
| 18 | GET /api/campaigns/options returns only {_id, title}, active campaigns by default | ☐ |
| 19 | GET /api/payment-receiving returns a single object (not an array); GET /api/payment-receiving/:id requires a token | ☐ |
| 20 | Donation submitted → screenshot/ folder | ☐ |
| 21 | Duplicate transactionId → 409 | ☐ |
| 22 | GET /api/donations (public) excludes pending donations; stats ignore search/pagination filters | ☐ |
| 23 | GET /api/donations/recents returns latest verified donations, newest first, capped at 30 | ☐ |
| 24 | GET /api/donations/admin (🔒) shows all statuses including pending; public GET /api/donations does not | ☐ |
| 25 | Verify → raisedAmount + campaign donations list + public donation list + stats all update | ☐ |
| 26 | **Double-verify → 409, amount NOT doubled** | ☐ |
| 27 | Reject → amount unchanged, never appears in public donation list | ☐ |
| 28 | Dashboard numbers match reality | ☐ |
| 29 | Soft delete hides campaign, keeps data | ☐ |
| 30 | Rate limit 429 on auth spam | ☐ |
| 31 | Contact message submitted → appears in admin list with status "new" | ☐ |
| 32 | Contact status update moves message between status filters (new → read) | ☐ |
| 33 | Contact message delete → 404 on subsequent GET | ☐ |
| 34 | Contact form rate limit 429 on spam | ☐ |

---

## Bug Reporting Template

When you find a bug, note it like this — makes fixing 10x faster:

```
Endpoint: PATCH /api/donations/:id/verify
Request:  { "remarks": "test" }
Expected: 409 on second call
Actual:   200, raisedAmount doubled to 2000
Token:    valid admin token used
```
