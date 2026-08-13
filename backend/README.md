# NGO Donation Verification Platform — Backend (JavaScript)

Node.js + Express + MongoDB backend implementing everything in `api.md`, organized entity-wise (each entity folder owns its model, controller, router, and validation). Plain JavaScript with ES modules (`"type": "module"` in package.json).

For the full list of endpoints grouped by module see **[api.md](api.md)**. For request/response shapes and a step-by-step manual testing walkthrough see **[api-test.md](api-test.md)**.

## Folder Structure

```
ngo-backend/
├── server.js                  # Entry point — only starts the server
├── src/
│   ├── app.js                 # Express app, middleware, router mounting
│   ├── config/
│   │   ├── config.js          # Frozen env config (dotenv)
│   │   └── db.js              # Mongoose connection
│   ├── middlewares/
│   │   ├── authenticate.js    # JWT Bearer auth (sets req.adminId) — the only "admin
│   │   │                      # authorization" mechanism; there is no separate admin module
│   │   ├── globalErrorHandler.js
│   │   ├── rateLimiter.js     # api / auth / donation limiters
│   │   ├── upload.js          # Multer (organized folders, 5MB, jpeg/png/webp)
│   │   └── validate.js        # Zod validation middleware + objectId schema
│   ├── auth/                  # Login/session — owns the Admin model
│   │   ├── adminModel.js
│   │   ├── authController.js  # login, verify-otp (Speakeasy → JWT + user), me, logout
│   │   ├── authValidation.js  # Zod schemas
│   │   └── authRouter.js
│   ├── profile/                # The authenticated admin's own profile
│   │   ├── profileController.js  # get/update profile, change password, upload avatar
│   │   ├── profileValidation.js
│   │   └── profileRouter.js
│   ├── campaign/
│   │   ├── campaignModel.js         # references PaymentReceivingAccount
│   │   ├── campaignConstants.js
│   │   ├── campaignValidation.js    # Zod schemas
│   │   ├── campaignController.js
│   │   └── campaignRouter.js        # /api/campaigns — public list/detail/:id/donations,
│   │                                # authenticate-protected create/update/delete + /admin
│   │                                # listing, all in one router (no separate admin file)
│   ├── donation/
│   │   ├── donationModel.js         # includes auditLog for verification history
│   │   ├── donationConstants.js
│   │   ├── donationValidation.js    # Zod schemas (with multipart coercion)
│   │   ├── donationController.js
│   │   └── donationRouter.js        # /api/donations — public submit/list-verified/recents,
│   │                                # authenticate-protected /admin listing + verify/reject,
│   │                                # all in one router (no separate admin file)
│   ├── paymentReceiving/      # QR / UPI / bank details donors pay into
│   │   ├── paymentReceivingModel.js
│   │   ├── paymentReceivingValidation.js
│   │   ├── paymentReceivingController.js
│   │   └── paymentReceivingRouter.js  # /api/payment-receiving — public reads, admin writes
│   ├── contact/                # "Send Us a Message" contact form submissions
│   │   ├── contactModel.js
│   │   ├── contactConstants.js       # statuses (new/read/responded) + interest options
│   │   ├── contactValidation.js
│   │   ├── contactController.js
│   │   └── contactRouter.js          # /api/contact — public submit, admin manage
│   ├── dashboard/
│   │   ├── dashboardController.js
│   │   └── dashboardRouter.js
│   └── upload/                # Generic uploader for campaign thumbnail/gallery images
│       ├── uploadController.js
│       └── uploadRouter.js
├── scripts/
│   ├── seedAdmin.js            # Creates the admin + OTP secret
│   └── seedPaymentReceiving.js # Creates the default PaymentReceivingAccount
└── public/uploads/            # Uploaded images (served at /uploads)
```

Admin-only functionality lives inside the same router/controller file as the rest of its feature (e.g. donation verify/reject sits right next to `POST /api/donations` in `donationRouter.js`) and is gated purely by applying the `authenticate` middleware to that specific route — there's no separate "admin" module and no separate `admin*Router.js` file per feature.

## Setup

```bash
cp .env.example .env    # fill in MONGO_CONNECTION_STRING, JWT_SECRET, admin creds
npm install
npm run seed:admin      # creates the administrator account
npm run seed:payment    # creates the default payment receiving account (QR/UPI/bank)
npm run dev             # nodemon
```

`seed:payment` requires `PAYMENT_UPI_ID` or `PAYMENT_ACCOUNT_NUMBER` in `.env` (plus whichever related fields you have — `PAYMENT_ACCOUNT_NAME`, `PAYMENT_BANK_NAME`, `PAYMENT_IFSC_CODE`, `PAYMENT_BRANCH`, `PAYMENT_QR_CODE`). It's safe to re-run — it no-ops if a default account already exists.

Production: `npm start`

## Auth Flow (Speakeasy OTP)

1. `POST /api/auth/login` with email + password → server generates a 5-minute TOTP from the admin's stored secret. In `NODE_ENV=development` the OTP is returned in the response and logged to console; in production, wire it to email/SMS delivery.
2. `POST /api/auth/verify-otp` with email + otp → returns JWT (7-day expiry).
3. Send `Authorization: Bearer <token>` on all protected routes.

The seed script also prints an `otpauth://` URL — scan it into Google Authenticator if you prefer app-based OTPs.

## Notes

- **Verification is race-safe**: verify/reject atomically flips `pending → verified/rejected` via `findOneAndUpdate`, so a donation can never be double-counted into `raisedAmount`.
- **Duplicate protection**: same `transactionId` can't be submitted twice for the same campaign while a `pending` or `verified` donation already holds it. If that donation was `rejected`, the same `transactionId` can be resubmitted — it reuses the rejected record and moves it back to `pending` for re-review (the rejection stays in `auditLog`).
- **Audit log**: every donation stores submitted/resubmitted/verified/rejected entries with admin and timestamp (returned in `GET /api/donations/:id` as verification history).
- **Soft delete**: `DELETE /api/campaigns/:id` sets `isDeleted: true` and leaves `status` untouched — archiving is an admin action (`isDeleted`), not a campaign status. `DELETE /api/payment-receiving/:id` similarly soft-deletes, and is blocked with `409` while any campaign still references the account.
- **80G / PAN**: donations may opt into an 80G tax exemption via `is80GApplicable`; when `true`, `panNumber` is required and validated (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`, stored uppercase). `GET /api/donations/admin` can filter on `is80GApplicable=true|false`.
- **Donation emails**: verifying or rejecting a donation sends the donor an email (via `src/mail`) once the status update has committed. Email failures are logged and never revert the donation's status.
- **Payment receiving accounts**: every campaign references one `PaymentReceivingAccount` via `paymentReceivingAccountId`. Today there's a single default account (`isDefault: true`) that new campaigns auto-attach when none is specified; the model already supports multiple accounts and explicit per-campaign selection later — no schema change needed for that.
- **Contact messages**: `DELETE /api/contact/:id` is a hard delete (unlike campaigns/payment accounts) — nothing else references a contact message, so there's no soft-delete/orphaning concern.
- Cloudinary keys are kept in config for a future migration, but storage is local (Multer → `public/uploads`) per the spec.

## Validation (Zod)

All request validation uses Zod. Each entity owns its schemas (`authValidation.js`, `campaignValidation.js`, `donationValidation.js`, `profileValidation.js`, `paymentReceivingValidation.js`, `contactValidation.js`) and the shared `validate(schema)` middleware parses `{ body, query, params }`, writes the parsed/coerced values back to `req.body`, and returns the standard error shape on failure. Multipart form fields (donation `amount`, `paymentDate`) are coerced from strings automatically.

## verify-otp Response

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "6a72eac2b274ea767a4384d7",
    "name": "Abhishek_Sharma",
    "email": "admin@ngo.org",
    "role": "SUPER_ADMIN"
  }
}
```

The JWT payload includes `{ sub: adminId, role }`. Admin model has a `role` field (`SUPER_ADMIN` | `ADMIN`, default `SUPER_ADMIN`).


## Organized Uploads

Files are stored in typed subfolders under `public/uploads/`, each tied to the feature that owns it. There is no generic `misc` fallback — an invalid/missing `type` is rejected with `400`.

```
public/uploads/
├── thumbnail/     # campaign cover images (src/upload/, used by campaign create/edit)
├── gallery/       # campaign gallery images (src/upload/, used by campaign create/edit)
├── screenshot/    # donor payment screenshots (src/donation/ — forced automatically)
├── profile/       # admin avatar photos (src/profile/ — forced automatically)
└── qrcode/        # payment receiving QR codes (src/upload/, used by payment receiving admin UI)
```

**Endpoints:**

- `POST /api/uploads/image?type=thumbnail|gallery|qrcode` — single file, form-data key `image` → `{ url, type }`
- `POST /api/uploads/images?type=gallery` — multiple files (max 10), form-data key `images` → `{ urls: [], type, count }`
- `POST /api/profile/avatar` — single file, form-data key `avatar` → uploads and sets the authenticated admin's avatar in one step
- Donor screenshots via `POST /api/donations` are forced into `screenshot/` by the route itself, no query param needed.

See [api.md](api.md) for the full request/response contract of every endpoint.
