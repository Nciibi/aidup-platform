# Agent Instructions: "Create Campaign" Tab — AidUp Organizer App

## Overview

You are adding a **new bottom navigation tab** to the AidUp Organizer Android app (Jetpack Compose). This tab sits **between the Dashboard tab and the Profile tab** in the bottom bar. Its label is **"Create Campaign"** and its icon is `Icons.Outlined.AddCircleOutline` (or `add_circle` Material symbol).

---

## Tab Routing Logic

When the organizer taps the "Create Campaign" tab, the app calls:

```
GET /organizor/organizerSituation
```

The response shape is:

```json
{
  "is_verified": true | false,
  "status": "pending" | "rejected" | "approved" | null
}
```

Use this response to decide which of the 3 screens to show:

```
GET /organizor/organizerSituation
         |
         ▼
  is_verified == true?
    YES → Show Screen 3: Campaign Creation UI
    NO  → check status
            |
            ├── status == "pending"  → Show Screen 2: Pending Screen
            |
            ├── status == "rejected" → Check local stored timestamp
            |       Has 24h passed since rejection?
            |         YES → Show Screen 1: Verification Form (reset allowed)
            |         NO  → Show a Countdown Screen (time remaining before retry)
            |
            └── status == null / anything else → Show Screen 1: Verification Form
```

Store the rejection timestamp in **DataStore** (not SharedPreferences) using the key `"rejection_timestamp"`. Persist it as a `Long` (epoch milliseconds). Clear it once the 24h window expires and the form is shown again.

---

## Screen 1 — Verification Form (`OrganizerVerificationScreen`)

> **This is the only screen you need to implement and make fully functional right now.**
> Screens 2 and 3 are stubs — just show a placeholder `Text("Pending...")` and `Text("Create Campaign coming soon")` respectively.

### File
The verification form UI already exists at:
```
OrganizerDashboardScreen.kt   ← this IS the verification form screen
```
Rename or alias it to make it clear it is `Screen 1 / Verification Form`. Do not rebuild the UI — it is already pixel-perfect. Your job is to **wire it to the backend**.

### What the form collects
- Full Legal Name (String)
- Phone Number (String)
- Uploaded document files (one or more URIs selected via file picker)

### API call to make on "Save & Continue"

```
POST /organizor/submitVerification
Content-Type: multipart/form-data

Fields:
  - name    : String
  - phone       : String
  - images   : List<File>  (one or more files, key = "images")
```

### Implementation steps

1. **ViewModel** — Create `VerificationViewModel` with:
   - `uiState: StateFlow<VerificationUiState>` (Idle, Loading, Success, Error)
   - `fun submitVerification(fullName: String, phone: String, uris: List<Uri>, context: Context)`

2. **Repository / API call** — Use `OkHttp` or `Retrofit` with `MultipartBody`:
   ```kotlin
   val body = MultipartBody.Builder().setType(MultipartBody.FORM)
       .addFormDataPart("fullName", fullName)
       .addFormDataPart("phone", phone)
   uris.forEach { uri ->
       val stream = context.contentResolver.openInputStream(uri)!!
       val bytes = stream.readBytes()
       val fileName = uri.lastPathSegment ?: "document"
       body.addFormDataPart("documents", fileName,
           bytes.toRequestBody("application/octet-stream".toMediaType()))
   }
   // POST to: BASE_URL + "/organizor/submitVerification"
   // Include Authorization: Bearer <access_token> header
   ```

3. **On success** (HTTP 200/201):
   - Transition the tab state to `Screen 2 (Pending)`
   - Do NOT navigate away — just update the state in the shared tab ViewModel

4. **On error**:
   - Show a snackbar or inline error message
   - Keep the form filled (don't reset)

5. **Loading state**:
   - Disable the "Save & Continue" button and show a `CircularProgressIndicator` inside it while the request is in flight

### Auth header
Every request must include:
```
Authorization: Bearer <accessToken>
```
Retrieve the access token from DataStore using the same key used in your existing auth flow.

---

## Bottom Navigation Bar Changes

Add a new `BottomNavItem` between Dashboard and Profile:

```kotlin
BottomNavItem(
    label    = "Create",
    icon     = Icons.Outlined.AddCircleOutline,
    route    = "create_tab"
)
```

The tab triggers `GET /organizor/organizerSituation` **every time it is selected** (not just on first load) so the state is always fresh. Show a loading spinner while this check is in flight.

---

## Shared State / Tab ViewModel

Create a `CreateTabViewModel` that:
- Holds `tabScreen: StateFlow<CreateTabScreen>` — enum of `VERIFICATION`, `PENDING`, `CAMPAIGN_CREATION`
- Calls `GET /organizor/organizerSituation` → sets the correct screen
- Exposes `fun onVerificationSubmitted()` → sets state to `PENDING`
- Handles rejection timestamp logic (DataStore read/write)

```kotlin
enum class CreateTabScreen {
    VERIFICATION,
    PENDING,
    CAMPAIGN_CREATION,
    REJECTION_COUNTDOWN
}
```

---

## File Structure (suggested)

```
ui/
  createtab/
    CreateTabScreen.kt          ← routing composable + bottom bar item
    CreateTabViewModel.kt       ← situation check + state routing
    verification/
      OrganizerVerificationScreen.kt   ← existing UI (already built)
      VerificationViewModel.kt         ← NEW: handles submitVerification API call
    pending/
      PendingScreen.kt          ← stub: "Your request is under review"
    campaign/
      CampaignCreationScreen.kt ← stub: "Create Campaign coming soon"
```

---

## Design System Tokens (reference)

Match the existing AidUp design system exactly:

| Token | Value |
|---|---|
| Primary | `#2255FF` |
| PrimaryDim | `#003DD6` |
| Secondary | `#006E2A` |
| SurfaceBase | `#F8F9FA` |
| SurfaceContLow | `#F3F4F5` |
| SurfaceContHighest | `#E1E3E4` |
| OnSurface | `#191C1D` |
| OnSurfaceVariant | `#434656` |
| Error/Rust | `#952B00` |
| Font (headlines) | Manrope ExtraBold |
| Font (body) | Inter |
| Corner radius (cards) | 16dp |
| Corner radius (buttons) | 14dp |
| Button gradient | `#2255FF` → `#003DD6` (top-left to bottom-right) |

---

## What NOT to do

- Do NOT rebuild `OrganizerVerificationScreen.kt` — the UI is done
- Do NOT use SharedPreferences — use DataStore for all persistence
- Do NOT hardcode the base URL — read it from your existing `BuildConfig` or constants file
- Do NOT show Screen 3 (Campaign Creation) until `is_verified == true` from the API

---

## Summary of immediate task

1. Add "Create" tab to the bottom nav bar
2. Wire `GET /organizor/organizerSituation` to route between screens
3. Make the verification form submit `POST /organizor/submitVerification` as multipart
4. Handle loading/success/error states on the form
5. Screens 2 and 3 are stubs for now