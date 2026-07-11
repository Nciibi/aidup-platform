# Auth And Security

## Token Model

Implemented in `utils/tokenUtils.js`.

- access token expiry: `15m`
- refresh token expiry: `7d`
- refresh cookie name: `jwt`

Refresh cookie settings:

- `httpOnly: true`
- `sameSite: 'None'`
- `secure: process.env.NODE_ENV === 'production'`
- `maxAge: 7 days`

## JWT Verification

Implemented in `middleware/verifyJWT.js`.

Behavior:

- checks bearer token first
- falls back to `req.cookies.jwt`
- verifies with `JWT_SECRET`
- if that fails, retries with `REFRESH_TOKEN_SECRET`
- attaches `req.userId` and `req.userRole`

Security implication:

- protected routes can accept refresh tokens, weakening the normal access-token boundary

## Registration Flow

Main files:

- `controllers/authController.js`
- `utils/verificationUtils.js`
- `utils/registrationStore.js`

Flow:

1. registration request is validated
2. password is hashed
3. pending registration is stored in an in-memory `Map`
4. code is emailed
5. user verifies code
6. actual user document is created
7. access token and refresh cookie are issued

Operational limitation:

- server restart clears pending registrations
- multi-instance deployment would break this flow

## Login Flow

Features:

- searches user collections
- rejects password login for Google-auth users
- increments `loginAttempts`
- locks account for 15 minutes after 5 failures
- stores `lastLogin`, `lastIp`, and `deviceInfo`
- supports MFA
- rotates refresh tokens

Bug:

- MFA temp token is issued without `role`
- `verifyLoginMfa` expects `decoded.role`
- organizer MFA flow is therefore likely broken

## Google Login

Uses `GOOGLE_CLIENT_ID` with `google-auth-library`.

Behavior:

- verifies ID token
- rejects if Google email is not verified
- logs in existing Google-auth user
- creates a new donor or organizer if user does not exist

Weaknesses:

- new-user role comes from request body without route-level validation
- refresh token bookkeeping is incomplete for existing Google logins

## MFA

Uses `otplib` and `qrcode`.

Endpoints:

- setup
- verify/enable
- disable
- login verification

Limitations:

- no backup codes
- no recovery flow
- secret stored directly on user document

## Password Reset

Flow:

1. find donor or organizer by email
2. reject Google-auth accounts
3. generate reset token
4. store SHA-256 hash and expiry
5. email frontend reset URL
6. on reset, hash provided token and update password

## Two Verification Systems

The repo has two separate verification mechanisms.

### In-memory registration verification

- used by sign-up flow
- data lives in `pendingRegistrations`

### DB-backed `VerificationCode`

- used by `/auth/send-code` and related routes

This duplication should be unified or separated by explicit purpose.

## Upload Security

Implemented in `middleware/advancedUpload.js`.

Protections:

- MIME allow-list
- 5MB limit
- magic-number content checks
- SHA-256 dedupe
- WebP re-encoding with `sharp`

Gap:

- only `req.file` is processed
- routes using `upload.fields(...)` are not covered by the processor

## Logging And Errors

Audit logging:

- `middleware/auditLog.js` logs action metadata to MongoDB and a file

Weakness:

- it hooks `res.send`
- many handlers use `res.json`
- logging should be verified and probably rewritten around response finish events

Error logging:

- `middleware/errorLoggerMiddleware.js` logs file + audit DB records
- redacts a few sensitive fields from request body

## QR Auth Security

Flow:

- PC creates session
- phone validates session
- phone approves session while authenticated
- server emits token payload to socket room

Gaps:

- refresh token emitted to client over socket
- controller comments admit refresh token is not stored on user model during QR login
- no strong session binding to browser identity
