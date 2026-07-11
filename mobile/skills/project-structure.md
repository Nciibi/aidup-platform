# Project Structure

## Root Layout

### Build and Gradle

- `build.gradle.kts`: top-level Android and Kotlin plugin versions
- `settings.gradle.kts`: repository configuration and `:app` inclusion
- `gradle.properties`: AndroidX, JVM memory, and R class settings
- `app/build.gradle.kts`: Android module config and all app dependencies

### Documentation and Static References

- `README.md`: older high-level project description; no longer matches the full current codebase
- `*.html` files in repo root: design/reference exports for several screens
- `_agents/workflows/aidup_backend_architecture.md`: earlier architecture note, partially stale

### Generated Output

- `.gradle/`
- `build/`
- `app/build/`

These are generated artifacts, not source-of-truth code.

## App Module Source Layout

### `app/src/main/java/com/aidup/app`

#### Entry

- `MainActivity.kt`: single activity, theme state owner, nav host, bottom bar logic

#### Models

- `models/AidItem.kt`: legacy sample content and helper structs used by old UI/components
- `models/DonationCategory.kt`: category enum used in campaign filtering and discovery UI
- `models/auth/AuthModels.kt`: auth request and response DTOs
- `models/campaign/CampaignModels.kt`: campaign DTOs
- `models/donation/DonationModels.kt`: donation and payment DTOs
- `models/profile/ProfileModels.kt`: donor profile DTOs

#### Navigation

- `navigation/AppNavigation.kt`: route constants and route builders

#### Network

- `network/ApiService.kt`: Retrofit endpoint definitions
- `network/RetrofitClient.kt`: Retrofit and OkHttp setup
- `network/TokenManager.kt`: encrypted local token and user metadata store

#### Repositories

- `repository/AuthRepository.kt`
- `repository/CampaignRepository.kt`
- `repository/DonationRepository.kt`
- `repository/ProfileRepository.kt`
- `repository/QrAuthRepository.kt`

#### UI Components

- `ui/components/Components.kt`: reusable cards and chips, mostly older `AidItem`-based helpers

#### Screens

- `ui/screens/OnboardingScreen.kt`
- `ui/screens/Login.kt`
- `ui/screens/Signup.kt`
- `ui/screens/OTPVerificationScreen.kt`
- `ui/screens/HomeFeedScreen.kt`
- `ui/screens/AllCampaignsScreen.kt`
- `ui/screens/DetailsScreen.kt`
- `ui/screens/DonationEvidenceScreen.kt`
- `ui/screens/SearchDiscoveryScreen.kt`
- `ui/screens/UserProfileScreen.kt`
- `ui/screens/Editprofilescreen.kt`
- `ui/screens/OrganizerDashboardScreen.kt`
- `ui/screens/QRLoginScreen.kt`

#### Theme

- `ui/theme/Color.kt`
- `ui/theme/Theme.kt`
- `ui/theme/Type.kt`

#### View Models

- `ui/viewmodels/AuthViewModel.kt`
- `ui/viewmodels/CampaignDetailsViewModel.kt`
- `ui/viewmodels/DonationViewModel.kt`
- `ui/viewmodels/HomeFeedViewModel.kt`
- `ui/viewmodels/OrganizerDashboardViewModel.kt`
- `ui/viewmodels/QrViewModel.kt`
- `ui/viewmodels/Searchviewmodel.kt`
- `ui/viewmodels/UserProfileViewModel.kt`

#### Utilities

- `utils/QrCodeAnalyzer.kt`: CameraX frame analyzer backed by ZXing

### `app/src/main/res`

- `values/strings.xml`: app name and Google web client id
- `values/themes.xml`: app theme declaration
- `values/font_certs.xml`: Google Fonts certificates
- `values/file_paths.xml`: cache-path provider config for camera/photo temp files

### `app/src/main/AndroidManifest.xml`

Declares:

- internet permission
- camera permission
- cleartext traffic allowed
- `MainActivity`
- `FileProvider`

### `app/src/test/java`

- `AidItemTest.kt`: outdated sample-data test

## Architectural Reality of the Tree

The tree contains two generations of code:

- current network-backed Compose screens using `Campaign`, `Donation`, and auth/profile DTOs
- older sample-data helpers built around `AidItem`

Both coexist, which is why some classes are active while others are effectively legacy.
