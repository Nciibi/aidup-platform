# Known Gaps and Risks

This file captures issues visible from the current source so the architecture docs do not accidentally describe the project as more complete or more consistent than it is.

## 1. Compile and Contract Drift

### Missing `Screen.LoginSignup`

Referenced in:

- `Login.kt`
- `OTPVerificationScreen.kt`

Reality:

- `AppNavigation.kt` does not define `LoginSignup`

Impact:

- navigation code will not compile as written

### `AuthRepository` and `AuthViewModel.register()` disagree

Reality:

- `AuthViewModel.register()` calls `authRepository.register(name, email, password, role, phoneNumber, photo)`
- `AuthRepository` only defines `register(request: RegisterRequest)`

Impact:

- compile-time mismatch

### `ApiService.register()` is multipart, but repository calls it like a JSON endpoint

Reality:

- `ApiService.register(...)` expects multipart pieces
- `AuthRepository.register()` calls `apiService.register(request)`

Impact:

- compile-time mismatch and wrong transport format

### `AuthResponse` only contains `userinfo`, but repository reads `body.user`

Referenced in:

- `AuthRepository.kt`

Impact:

- compile-time mismatch unless a different unseen model exists

### `OrganizerDashboardViewModel` depends on missing Retrofit endpoint

Reality:

- it calls `RetrofitClient.instance.getOrganizerDashboard()`
- `ApiService.kt` does not define `getOrganizerDashboard`

Impact:

- organizer dashboard cannot compile or run as written

### `UserProfileViewModel` has duplicate init logic and undefined methods

Reality:

- one `init` calls `loadProfileData()`
- another `init` calls `loadProfile()` and `loadDonationHistory()`
- those methods do not exist

Impact:

- compile-time failure

## 2. Multipart Naming Drift

### Profile photo part name is inconsistent

Observed names:

- screen creates form data with name `"images"`
- API declaration uses `@Part photo`
- profile endpoint comment says uploaded file is `photo`

Impact:

- backend may not receive the expected file key

### Donation evidence part name is inconsistent

Observed names:

- API method parameter is `evidance`
- repository calls the argument `images`
- view model creates multipart parts with form field `"images"`
- API comment says backend expects `evidance`

Impact:

- upload may fail or backend may ignore files

## 3. Unfinished Screen Flows

### DonationEvidenceScreen is not wired to backend submission

Reality:

- submit button only checks that at least one photo exists and sets `isSubmitting`
- no `DonationViewModel` is used in the screen
- amount and payment method are not collected in the UI

Impact:

- route exists, UI exists, backend contract exists, but end-to-end submission is incomplete

### DetailsScreen donate navigation is broken

Reality:

- top-level donate navigation is commented out
- bottom bar contains code using `TokenManager`, `navController`, and `itemId` outside valid scope

Impact:

- campaign details cannot reliably launch donation evidence flow

### EditProfileScreen save action is placeholder only

Reality:

- save button only shows snackbar `"Profile updated"`
- no repository update for name, phone, preferences, or password

Impact:

- profile edits other than image do not persist

### Delete account is not implemented

Reality:

- delete dialog logs the user out locally
- no backend delete call is made

Impact:

- destructive account UI is misleading

## 4. Model Drift

### `DonatorData` lacks fields screens expect

Screens expect:

- `username`

Actual model:

- no `username`

Impact:

- `EditProfileScreen` references `uiState.profileData?.username`

### Organizer dashboard uses view-model-local DTOs

Impact:

- API contract is harder to centralize

### Legacy `AidItem` sample world still exists

Reality:

- `AidItem.kt`, `Components.kt`, and `AidItemTest.kt` reflect an older sample-data architecture

Impact:

- confusion about which model is authoritative

## 5. Resource and Manifest Concerns

### `FileProvider` is declared outside `<application>`

In the current manifest, `provider` appears after the closing `</application>`.

Impact:

- manifest structure is suspicious and may not be valid as intended

### Cleartext traffic is globally enabled

Reason:

- needed for local backend at `http://10.0.2.2:5000/`

Impact:

- acceptable for local development
- should be tightened for production

## 6. Search Efficiency

Current search strategy:

- fetch all donors or organizers
- filter locally on device

Impact:

- acceptable for small datasets
- poor fit for large public datasets

## 7. Testing Gaps

Only visible unit test:

- `AidItemTest.kt`

Problems:

- expects 6 sample items, but `AidItem.kt` currently defines 2
- expects first title `"Help Local Orphanage"`, but current first item is `"Support Rural Libraries"`

Impact:

- tests are stale
- there is effectively no reliable current feature coverage
