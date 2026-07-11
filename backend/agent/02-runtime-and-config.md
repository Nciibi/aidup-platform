# Runtime And Configuration

## Startup Sequence

### `server.js`

- loads `.env` through `dotenv`
- imports `{ app }` from `app.js`
- connects to MongoDB via `config/dboptions.js`
- creates an HTTP server
- initializes Socket.IO via `sockets/qr.socket.js`
- listens on `process.env.PORT || 5000`

It also logs:

- active port
- `NODE_ENV`
- `MONGO_URI`
- `FRONTEND_URL`

### `app.js`

Global middleware order:

1. `pino-http` with custom logger
2. `helmet`
3. `@exortek/express-mongo-sanitize`
4. `hpp`
5. auth-specific rate limiter mounted on `/auth`
6. `cors(corsOptions)`
7. `cookie-parser`
8. JSON, URL-encoded, and text body parsers
9. static file serving for `/uploads`
10. route mounting
11. error logger middleware
12. final JSON error handler

Health check:

- `GET /` returns `{"message":"ahla bik win tnjm t3awn lfou9ara2 :)"}`.

## Route Mount Table

- `/auth` -> `routes/authRoutes.js`
- `/auth/qr` -> `routes/qrAuth.routes.js`
- `/campain` -> `routes/campainRoutes.js`
- `/publicca` -> `public/publiccampains.js`
- `/organizor` -> `routes/organizorRoutes.js`
- `/publicor` -> `public/publicorganizer.js`
- `/admin` -> `routes/adminRoutes.js`
- `/donator` -> `routes/donatorRoutes.js`
- `/publicdo` -> `public/publicdonator.js`
- `/donation` -> `routes/donationRoutes.js`

## Environment Variables Observed In Code

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `FRONTEND_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `GOOGLE_CLIENT_ID`
- `EMAIL_USER`
- `EMAIL_PASS`
- `LOG_LEVEL`

Behavior tied to env vars:

- refresh/access JWT signing depends on `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Google login depends on `GOOGLE_CLIENT_ID`
- password reset links use `FRONTEND_URL`
- email service uses Gmail credentials
- cookie security changes with `NODE_ENV`
- CORS and Socket.IO origin handling rely on frontend origin configuration

## CORS

### `config/allowedorigins.js`

Allowed origins currently include:

- `http://localhost:3000`
- `http://localhost:5173`
- `""`

### `config/corsoptions.js`

Rules:

- allow explicit origins in the list
- also allow requests with no origin, such as curl or some mobile requests
- allow credentials
- allow standard JSON/auth headers

## Database Connection

### `config/dboptions.js`

- connects with `mongoose.connect`
- default fallback DB URI is `mongodb://localhost:27017/auth_template`
- process exits on connection failure

The fallback DB name does not match the project branding, which suggests template reuse.

## Logging

### `utils/logger.js`

Three pino logger outputs are configured:

- pretty console logs
- `logs/errorlogs/error.log`
- `logs/authlogs/audit.log`

There is a main logger plus dedicated `auditLogger` and `errorFileLogger`.

## Static Uploads

`app.js` exposes `uploads/` via:

- `/uploads`

The upload middleware stores processed image files under:

- `uploads/images/<year>/<month>/<day>/...`

## Missing Operational Pieces

Not present in the repository:

- `.env.example`
- test suite
- migration/seeding setup
- Docker config
- CI config
- structured health checks for DB/email/socket readiness
