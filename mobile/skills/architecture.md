# AidUp Architecture

## 1. High-Level Shape

AidUp follows a mostly standard Compose MVVM structure:

- `MainActivity` initializes secure token storage and owns the top-level `NavHost`
- Compose screens in `ui/screens` render UI and handle user interaction
- view models in `ui/viewmodels` hold screen state and call repositories
- repositories in `repository` translate screen intent into Retrofit requests
- `network/ApiService.kt` defines the backend contract
- model packages in `models/*` define request and response DTOs
- `TokenManager` persists access token and selected user metadata locally

The intended data flow is:

1. user interacts with a Compose screen
2. screen calls a view model method
3. view model delegates to a repository or directly to `RetrofitClient.instance`
4. repository invokes a Retrofit endpoint
5. OkHttp injects `Authorization: Bearer <token>` if a token exists
6. response is mapped into Kotlin models
7. view model updates a Compose state holder
8. screen recomposes from new state

## 2. Application Bootstrap

`MainActivity.kt` is the only activity.

Startup responsibilities:

- calls `TokenManager.init(this)` in `onCreate`
- creates `NavController`
- keeps `isDarkMode` as top-level compose state
- shows a bottom navigation bar only on:
  - `home_feed`
  - `search_screen`
  - `all_campaigns`
  - `profile`

Start destination:

- `onboarding`

## 3. Layer Responsibilities

### UI Layer

Files in `ui/screens` are full-screen composables. They:

- collect `uiState` from view models
- validate basic form input locally
- navigate through `NavController`
- convert image picks into multipart parts in some screens
- sometimes still contain TODOs instead of wired repository calls

### State Layer

Files in `ui/viewmodels` use `mutableStateOf` rather than `StateFlow`.

Patterns used:

- sealed UI state classes for auth, campaigns, QR, donations, dashboard
- simple `data class` state for profile
- `viewModelScope.launch` for async work

### Repository Layer

Repositories encapsulate network calls, response success checks, and token persistence.

Current repository set:

- `AuthRepository`
- `CampaignRepository`
- `DonationRepository`
- `ProfileRepository`
- `QrAuthRepository`

Not all view models consistently use repositories; some call `RetrofitClient.instance` directly.

### Network Layer

`RetrofitClient.kt` configures:

- base URL: `http://10.0.2.2:5000/`
- `GsonConverterFactory`
- `HttpLoggingInterceptor` at `BODY`
- auth interceptor that reads from `TokenManager`
- 90 second connect/read/write timeouts

### Persistence Layer

`TokenManager.kt` uses `EncryptedSharedPreferences` with `MasterKey`.

Stored values:

- access token
- user id
- user role
- user name
- user email
- organizer verification flag

This local store is read by:

- auth startup auto-login state
- profile fetches
- donation submission
- OTP screen email display
- logout handling

## 4. Auth Model

The app assumes JWT bearer auth.

Behavior:

- login, google login, and email verification may return an `accessToken`
- token is saved locally when repository logic succeeds
- every later request includes the token automatically through the interceptor

Role handling in the UI is explicit:

- users choose `Donator` or `Organizer`
- that role is included in login and registration payloads

## 5. Navigation Model

Routes are centralized in `navigation/AppNavigation.kt`.

Parameterized routes:

- `donation_evidence/{campaignId}/{donatorId}`
- `details_screen/{itemId}`

Navigation is otherwise simple string-based route movement from screens.

## 6. File and Camera Handling

Two upload flows exist:

- registration photo upload
- profile picture upload

Donation evidence UI also captures or selects photos, but final submission is not fully wired in the screen.

Implementation details:

- temporary files are written into app cache
- `FileProvider` is configured for cache-path access
- camera permission is declared in the manifest
- cleartext traffic is enabled to support the emulator-to-local-backend HTTP URL

## 7. QR Login Architecture

QR login combines:

- CameraX preview
- CameraX `ImageAnalysis`
- ZXing decoding through `QrCodeAnalyzer`
- `QrViewModel`
- `QrAuthRepository`
- backend session endpoints under `auth/qr/*`

Expected flow:

1. web app creates a QR session
2. mobile scans the QR
3. app extracts `sessionId`
4. app validates session through `GET auth/qr/scan/{sessionId}`
5. user approves login on mobile
6. app posts `sessionId` to `POST auth/qr/approve`

## 8. Design System

Theme assets live in `ui/theme`.

Design choices:

- custom Material 3 light and dark color schemes
- Manrope + Inter from Google Fonts
- reusable color tokens like `Primary`, `Secondary`, surface container variants
- `full = 50` used as a rounded shape constant in multiple screens

## 9. Testing State

Unit testing is minimal.

Only one test file exists:

- `AidItemTest.kt`

It currently tests outdated sample data assumptions and does not reflect the current app structure.
