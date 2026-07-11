# Navigation and Screen Contracts

## Route Table

| Route | Arguments | Screen | Purpose |
| --- | --- | --- | --- |
| `onboarding` | none | `OnboardingScreen` | intro carousel |
| `login_screen` | none | `LoginScreen` | email login and Google login |
| `register_screen` | none | `RegisterScreen` | account creation |
| `home_feed` | none | `HomeFeedScreen` | featured campaigns and discovery |
| `all_campaigns` | none | `AllCampaignsScreen` | paginated campaign list |
| `details_screen/{itemId}` | `itemId` campaign id | `DetailsScreen` | full campaign details |
| `search_screen` | none | `SearchDiscoveryScreen` | campaign/donator/organizer search |
| `profile` | none | `UserProfileScreen` | donor profile and donation history |
| `edit_profile` | none | `EditProfileScreen` | profile editing UI |
| `organizer_dashboard` | none | `OrganizerDashboardScreen` | organizer metrics and campaign management |
| `qr_login` | none | `QRLoginScreen` | scan and approve QR web login |
| `otp_verification` | none | `OTPVerificationScreen` | registration email verification |
| `donation_evidence/{campaignId}/{donatorId}` | `campaignId`, `donatorId` | `DonationEvidenceScreen` | donation proof upload UI |

## Bottom Navigation

Only these routes show the bottom bar:

- `home_feed`
- `search_screen`
- `all_campaigns`
- `profile`

## Screen-by-Screen Behavior

### OnboardingScreen

Inputs:

- none

Primary actions:

- `Skip` -> `login_screen`
- `Continue` pages through onboarding
- final button -> `login_screen`

Backend traffic:

- none

### LoginScreen

UI handlers:

- role toggle sets `Donator` or `Organizer`
- email/password sign-in
- Google sign-in via Credential Manager

Handler data expectations:

- email sign-in expects valid email, non-empty password, and selected role
- Google sign-in expects a Google ID token and selected role

Backend payloads sent:

- `LoginRequest`
  - `email`
  - `password`
  - `role`
- `GoogleLoginRequest`
  - `credential`
  - `role`

Navigation outcomes:

- success -> `home_feed`
- create account -> `register_screen`

Note:

- code references `Screen.LoginSignup.route`, but that route does not exist

### RegisterScreen

UI handlers:

- role toggle
- pick optional profile photo
- submit registration form

Handler data expectations:

- required: `name`, `email`, `password`, terms accepted, role
- optional: `phoneNumber`, `photo`

Backend payload sent:

- multipart `auth/register`
- text parts:
  - `name`
  - `email`
  - `password`
  - `role`
  - `phoneNumber` when present
- file part:
  - `photo` when selected

Navigation outcomes:

- success -> `otp_verification`

### OTPVerificationScreen

Handler data expectations:

- `email` comes from `TokenManager.getUserEmail()`
- user enters 6-digit code

Backend payload sent:

- `VerifyEmailRequest`
  - `email`
  - `code`

Navigation outcomes:

- success -> `home_feed`

### HomeFeedScreen

Backend traffic:

- loads public campaigns on view model init

Actions:

- QR button -> `qr_login`
- campaign card -> `details_screen/{campaignId}`
- view all -> `all_campaigns`

### AllCampaignsScreen

Backend traffic:

- reuses `HomeFeedViewModel` state

Actions:

- category filter
- pagination
- card tap -> `details_screen/{campaignId}`

### DetailsScreen

Input:

- `itemId`

Backend traffic:

- `GET publicca/one/{id}`

Intended next action:

- donate button should navigate to `donation_evidence/{campaignId}/{donatorId}`

Current state:

- donation navigation is partially commented and partially broken

### DonationEvidenceScreen

Inputs:

- `campaignId`
- `donatorId`

Handlers:

- gallery multiple image pick
- camera capture
- photo removal
- notes field
- submit

Handler data expectations:

- at least one selected photo
- route args should exist

Intended backend payload:

- multipart donation creation with:
  - `campaign_id`
  - `donator_id`
  - `amount`
  - `paiment_method`
  - evidence files

Current state:

- submit button does not call the view model or repository

### SearchDiscoveryScreen

Handlers:

- query change
- tab switch between `Campaigns`, `Donators`, `Organizers`

Backend traffic:

- campaigns tab: filters already-loaded campaign list client-side
- donators tab: fetches all public donators then filters locally
- organizers tab: fetches all public organizers then filters locally

Navigation:

- campaign row -> `details_screen/{campaignId}`
- donor/organizer rows do not navigate

### UserProfileScreen

Handlers:

- load donor profile and donation history
- upload profile picture
- filter local donation list by status
- navigate to edit profile
- QR button
- logout

Backend payloads sent:

- profile load uses local user id in `GET donator/getaccount/{id}`
- donation history uses `GET donator/readdonaions/all`
- profile photo update uses multipart `POST donator/editaccount`

Navigation:

- edit profile -> `edit_profile`
- QR -> `qr_login`
- logout -> `login_screen`

### EditProfileScreen

Handlers:

- upload profile picture
- edit local form state
- open biometric prompt before showing password fields
- save changes

Current backend integration:

- image upload only
- save button does not persist form fields

### OrganizerDashboardScreen

Handlers:

- load dashboard on init
- filter displayed campaigns by status tab
- search donation log client-side
- open QR screen
- open campaign details

Expected backend traffic:

- one organizer dashboard aggregate response

Current state:

- view model depends on missing `getOrganizerDashboard()` Retrofit method

### QRLoginScreen

Handlers:

- request camera permission
- scan QR
- approve detected session
- retry scanning

Handler data expectations:

- QR content may be raw session id or full URL containing `/auth/qr/scan/{sessionId}`

Backend payloads sent:

- scan validation uses route param `sessionId`
- approve uses JSON body `{ sessionId }`

Navigation:

- after successful approval, screen pops back

## Route Argument Contracts

### `details_screen/{itemId}`

- `itemId` must be a backend campaign `_id`

### `donation_evidence/{campaignId}/{donatorId}`

- `campaignId` should be a backend campaign `_id`
- `donatorId` should be the logged-in user id
