# Known Issues And Improvement Opportunities

This is the most important file for any follow-up agent work.

## Hard Failures

### `controllers/organizorController.js` exports undefined functions

Exported but not defined:

- `getOrganizor`
- `updateOrganizor`
- `deleteOrganizor`

Impact:

- importing this controller should throw `ReferenceError`

### `controllers/adminController.js` uses undefined identifiers

Examples:

- `bcrypt` is used but never imported
- `generateToken` is used but never defined or imported
- `Organizor` is referenced but the imported model is `Organizer`
- `Donor` is referenced but the imported model is `Donator`

Impact:

- admin login and user listing are broken

### Case-sensitive import issue in `app.js`

Import used:

- `./public/publicOrganizer`

Actual file:

- `public/publicorganizer.js`

Impact:

- breaks on case-sensitive filesystems

## Logic Bugs

### Authorization role casing mismatch

- `authorize` compares against uppercase `req.userRole`
- some routes pass lowercase role strings such as `'organizer'`

Impact:

- valid organizer access can be rejected

### MFA login token misses role

- login issues `mfaToken` without `role`
- MFA completion expects `decoded.role`

Impact:

- organizer MFA path is likely broken

### Donation list routes use missing params

- controller reads `req.params.donator_id`
- routes define no `:donator_id`

Impact:

- donor history queries are wrong

### Upload processor ignores `req.files`

- `processImage` only reads `req.file`
- many routes use `upload.fields`

Impact:

- those uploads are not processed by the image pipeline

### Campaign creation logic uses undefined model identifier

In `controllers/campainController.js`:

- `const paiment_method = await paiment_method.find().lean();`

Impact:

- runtime `ReferenceError`

### Campaign creation requires wrong inputs

Current checks require:

- `images`
- `videos`
- `paiment_methods`
- `organizer_id`

Impact:

- route is hard to use in real multipart flow
- organizer id should come from auth context

### Donation aggregation updates use wrong query shapes

Problems:

- `Campaindonation.find(...)` returns array but code treats it as single document
- deletion path looks up aggregate by donation id instead of campaign id

Impact:

- campaign donation totals are unreliable

### Campaign status mismatch in donation creation

- controller checks `'APPROVED'`
- schema enum uses lowercase `'approved'`

Impact:

- valid campaigns may fail donation creation

### Payment method validation compares incompatible values

- DB query returns objects
- code compares strings with `.includes`

Impact:

- valid payment methods may be rejected

### Organizer dashboard controller never responds

- `getDashboard` creates `data` but does not send it

Impact:

- request hangs or ends incorrectly

## Security And Data Exposure Risks

### Sensitive donor fields may be serialized

- donor schema does not strip password, refresh tokens, reset tokens, or MFA secret in `toJSON`

### Refresh tokens can be accepted on protected routes

- `verifyJWT` retries verification with refresh secret

### Email credentials are logged

In `services/emailService.js`:

- `console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);`

### Server logs database URI

In `server.js`:

- logs `MONGO_URI`

## Architectural Cleanup Opportunities

- normalize naming across files, routes, and schema fields
- normalize role casing across the entire stack
- split admin, self-service, and public controller responsibilities
- replace in-memory registration storage with Redis or a DB collection
- add test coverage for auth, authorization, campaign, donation, and QR flows
- add npm scripts, `.env.example`, CI, linting, and gitignore cleanup
- replace optimistic README claims with generated API documentation or OpenAPI
