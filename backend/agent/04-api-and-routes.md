# API And Routes

This file describes the mounted endpoints and what the code currently does.

## Auth Routes: `/auth`

Defined in `routes/authRoutes.js`.

### Registration And Identity

- `POST /auth/register`
  - upload middleware: `upload.single('image')`
  - validation: `registerSchema`
  - dispatches to donor or organizer registration
  - creates a pending in-memory registration and emails a verification code

- `POST /auth/verify-registration-email`
  - verifies code against in-memory store
  - creates actual `donator` or `organizer`
  - issues access token and refresh cookie

- `POST /auth/resend-registration-verification`
  - reissues an in-memory registration email code

- `POST /auth/google-login`
  - verifies Google ID token
  - logs in existing Google-auth user or creates a new donor/organizer user

### Login And Session

- `POST /auth/login`
  - rate limited
  - optional role-based lookup
  - local account lockout after repeated failures
  - updates device and login metadata
  - returns MFA token if MFA is enabled
  - otherwise rotates refresh tokens and returns access token

- `GET /auth/refresh`
  - rotates refresh token from cookie

- `POST /auth/logout`
  - clears refresh token cookie and removes stored token

### Password Recovery

- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### MFA

- `POST /auth/mfa/setup`
- `POST /auth/mfa/verify`
- `POST /auth/mfa/disable`
- `POST /auth/mfa/verify-login`

### Standalone Email Code Endpoints

- `POST /auth/send-code`
- `POST /auth/verify-code`
- `GET /auth/verification-status/:email`

### Embedded Admin Example

- `GET /auth/admin/dashboard`

## QR Auth Routes: `/auth/qr`

Defined in `routes/qrAuth.routes.js`.

- `POST /auth/qr/create`
- `GET /auth/qr/scan/:sessionId`
- `POST /auth/qr/approve`
- `GET /auth/qr/status/:sessionId`

Behavior:

- creates a short-lived session
- validates it on scan
- allows logged-in phone approval
- emits `qr:authenticated` to the matching socket room

## Campaign Routes: `/campain`

Defined in `routes/campainRoutes.js`.

All routes use `verifyJWT` + `loadUser`.

- `POST /campain/managecampain/add`
- `PUT /campain/managecampain/update/:id`
- `DELETE /campain/managecampain/delete/:id`

Current issue:

- these routes use `authorize('organizer')`
- middleware compares against uppercased role values
- a valid `ORGANIZER` can therefore be rejected

## Organizer Routes: `/organizor`

Defined in `routes/organizorRoutes.js`.

Account:

- `POST /organizor/editaccount`
- `GET /organizor/getaccount/:id`
- `DELETE /organizor/deleteaccount/:id`

Campaign reads:

- `GET /organizor/readcampains/one/:id`
- `GET /organizor/readcampains/all`
- `GET /organizor/readcampains/all/approved`
- `GET /organizor/readcampains/all/pending`
- `GET /organizor/readcampains/all/rejected`

Dashboard:

- `GET /organizor/dashboard`

Critical issue:

- the imported organizer controller exports undefined account functions

## Admin Routes: `/admin`

Defined in `routes/adminRoutes.js`.

Admin auth:

- `POST /admin/admin-login`
- `GET /admin/refresh`
- `POST /admin/logout`

Dashboard:

- `GET /admin/admin/dashboard`

User and organizer management:

- `GET /admin/getAllUsers`
- `GET /admin/all`
- `GET /admin/getOrganizor/:id`
- `PUT /admin/updateOrganizor/:id`
- `DELETE /admin/deleteOrganizor/:id`
- `GET /admin/getAllApprovedorganizors`
- `GET /admin/getAllRejectedorganizors`
- `GET /admin/getAllPendingorganizors`

Donor management:

- `GET /admin/getDonor/:id`
- `PUT /admin/updateDonor/:id`
- `DELETE /admin/deleteDonor/:id`

Campaign moderation:

- `GET /admin/getAllPendingCampains`
- `GET /admin/getAllApprovedCampains`
- `GET /admin/getAllRejectedCampains`
- `GET /admin/getAllCampains`
- `GET /admin/getCampainById/:id`
- `PUT /admin/updateCampain/:id`
- `DELETE /admin/deleteCampain/:id`

Verification:

- `GET /admin/getAllVerifications`
- `GET /admin/getVerificationById/:id`
- `PUT /admin/updateVerification/:id`
- `DELETE /admin/deleteVerification/:id`

Donation moderation:

- `GET /admin/getAllDonations`
- `GET /admin/getDonationById/:id`
- `PUT /admin/updateDonation/:id`
- `DELETE /admin/deleteDonation/:id`

Audit logs:

- `GET /admin/getAllAuditLogs`
- `GET /admin/getAuditLogById/:id`
- `DELETE /admin/deleteAuditLog/:id`

Important note:

- the route coverage is broad, but the underlying controller is not reliable without repair

## Donator Routes: `/donator`

Defined in `routes/donatorRoutes.js`.

Account:

- `POST /donator/editaccount`
- `GET /donator/getaccount/:id`
- `DELETE /donator/deleteaccount/:id`

Donation reads:

- `GET /donator/readdonaions/one/:id`
- `GET /donator/readdonaions/all`
- `GET /donator/readdonaions/all/approved`
- `GET /donator/readdonaions/all/pending`
- `GET /donator/readdonaions/all/rejected`

Current logic bug:

- donation list handlers read `req.params.donator_id`, but no route defines that param

## Donation Routes: `/donation`

Defined in `routes/donationRoutes.js`.

- `POST /donation/createDonation`

Current logic issues:

- controller trusts `donator_id` from request body
- upload config uses `upload.fields`, but the image processor only reads `req.file`

## Public Routes

Public campaigns:

- `GET /publicca/one/:id`
- `GET /publicca/all`

Public organizers:

- `GET /publicor/one/:id`
- `GET /publicor/all`

Public donators:

- `GET /publicdo/one/:id`
- `GET /publicdo/all`

## Socket.IO Contract

Defined in `sockets/qr.socket.js`.

Client flow:

- connect socket
- emit `qr:join-session` with session id
- listen for `qr:authenticated`

The event payload includes access token, refresh token, token type, and expiry.
