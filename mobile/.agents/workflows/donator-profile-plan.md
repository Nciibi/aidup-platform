# Donator Profile and Campaigns Implementation Plan

## Objective
Replace placeholder data in the Donator `UserProfileScreen` with real data fetched from the backend APIs. This includes updating the profile picture, dynamically calculating the donation stats, rendering real donation history instead of mock data, and adding the ability to edit the profile.

## Target Backend APIs
We will integrate with the following protected endpoints in `donatorRoutes.js`:
1. **Profile Data:** `GET /api/donator/getaccount/{id}`
2. **Edit Profile:** `POST /api/donator/editaccount` (Multipart/form-data for image uploads)
3. **Donation History:** `GET /api/donator/readdonaions/all` (and specific status filters if needed)

## Implementation Steps

### 1. Network Layer (`ApiService.kt` & Models)
- **Models:** Create data classes in `ProfileModels.kt` or `DonationModels.kt` for:
  - `DonatorProfileResponse` (containing name, email, profile picture URL, etc.)
  - `DonationHistoryResponse` (containing list of donations, amounts, campaigns, dates, statuses)
- **ApiService:** Add new suspended functions:
  ```kotlin
  @GET("api/donator/getaccount/{id}")
  suspend fun getDonatorProfile(@Header("Authorization") token: String, @Path("id") id: String): Response<DonatorProfileResponse>

  @GET("api/donator/readdonaions/all")
  suspend fun getDonatorDonations(@Header("Authorization") token: String): Response<DonationHistoryResponse>
  ```
  *(Note: and a multipart POST for `editaccount`)*

### 2. Repository Layer (`ProfileRepository.kt` & `DonationRepository.kt`)
- Create new repositories (or update existing ones) to interact with `ApiService` safely (handling `Result<T>`, catching exceptions).
- Fetch the user token and ID from `TokenManager`.

### 3. ViewModel Layer (`UserProfileViewModel.kt`)
- Create `UserProfileViewModel` to manage the `UiState` for the profile screen.
- State will hold: `isLoading`, `profilePicUrl`, `totalDonated`, `campaignsSupported`, and `List<DonationItem>`.
- Expose functions to fetch the initial data on screen load.
- Expose functions to handle the "Edit Profile" logic (opening an image picker and uploading).

### 4. UI Layer (`UserProfileScreen.kt`)
- Inject `UserProfileViewModel` into the screen.
- Collect the state using `collectAsState()`.
- Replace the hardcoded `AsyncImage` URLs with `state.profilePicUrl`.
- Replace the hardcoded "StatsGrid" values with `state.totalDonated` and `state.campaignsSupported`.
- Replace the hardcoded `ImpactHistoryItem` list with a dynamic `LazyColumn.items` over `state.donationHistory`.
- Add an `ImagePicker` launcher to handle profile picture changes when the edit button is clicked.

## Next Steps
Once this plan is approved, I will immediately begin executing these steps layer by layer, starting with the Network models and moving up to the UI.
