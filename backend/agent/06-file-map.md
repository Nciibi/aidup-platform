# File Map

This is a concise file-by-file map of the repository.

## Root

- `server.js`: process bootstrap, DB connect, HTTP server creation, Socket.IO init, listen
- `app.js`: Express app setup, middleware, route mounting, error handling
- `package.json`: dependency manifest only, no scripts defined
- `package-lock.json`: lockfile
- `README.md`: API-oriented documentation, more optimistic than the actual code

## `config/`

- `allowedorigins.js`: hard-coded allowed frontend origins
- `corsoptions.js`: dynamic origin checker and CORS headers
- `dboptions.js`: MongoDB connection helper

## `controllers/`

- `authController.js`: registration, login, Google login, refresh/logout, password reset, MFA
- `emailController.js`: DB-backed email code send/verify/status
- `qrAuth.controller.js`: QR session create, scan, approve, poll
- `campainController.js`: organizer campaign CRUD, admin campaign listing, public campaign reads
- `organizorController.js`: public organizer reads, placeholder dashboard, broken exports for account CRUD
- `donatorController.js`: public donor reads
- `donationController.js`: donation creation and donor donation list handlers
- `adminController.js`: admin login plus broad management functions, but contains multiple undefined identifiers and likely runtime failures

## `middleware/`

- `verifyJWT.js`: auth token extraction and verification
- `loadUser.js`: fetch current user document
- `authorize.js`: role-based guard
- `auditLog.js`: action audit middleware
- `advancedUpload.js`: multer upload and image processing
- `loginLimiter.js`: login rate limiter
- `validate.js`: Zod request validation wrapper
- `validateRegisterRole.js`: safe registration role guard, currently unused in routes
- `errorLoggerMiddleware.js`: error logging middleware factory

## `models/`

- `admin.js`
- `donator.js`
- `organizer.js`
- `campaign.js`
- `campaindonation.js`
- `donation.js`
- `orgverification.js`
- `paimentmethods.js`
- `AuditLog.js`
- `QrSession.js`
- `VerificationCode.js`

## `routes/`

- `authRoutes.js`
- `qrAuth.routes.js`
- `campainRoutes.js`
- `organizorRoutes.js`
- `adminRoutes.js`
- `donatorRoutes.js`
- `donationRoutes.js`

## `public/`

- `publiccampains.js`: public campaign routes
- `publicorganizer.js`: public organizer routes
- `publicdonator.js`: public donor routes

Note:

- `app.js` imports `./public/publicOrganizer` with a capital `O`, but the file on disk is `publicorganizer.js`. This works on Windows but will fail on case-sensitive filesystems.

## `services/`

- `emailService.js`: nodemailer transporter and email templates
- `qrAuth.service.js`: QR session lifecycle helpers

## `sockets/`

- `qr.socket.js`: Socket.IO initialization and room join event

## `utils/`

- `validationSchemas.js`: Zod schemas for register/login/reset/verify-email
- `verificationUtils.js`: pending registration verification logic
- `registrationStore.js`: in-memory `Map`
- `tokenUtils.js`: JWT pair issuance and cookie helper
- `logger.js`: pino loggers
- `imageValidation.js`: magic number checks
- `imageHash.js`: buffer hashing
- `emailValidator.js`: unused email regex helper
- `phoneValidator.js`: unused phone helper
- `passwordvalidator.js`: unused password helper

## `scripts/`

- `clear_test_user.js`: deletes a hard-coded email from admin/donor/organizer collections

## `logs/`

- `logs/errorlogs/error.log`
- `logs/authlogs/audit.log`

These are runtime artifacts and should usually be gitignored.
