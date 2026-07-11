---
description: AidUp Backend Architecture and Frontend Integration Plan
---

# AidUp Android to Backend Integration Guide

This document captures the detailed backend architecture, data models, and the frontend Android (Kotlin/Compose) integration for the AidUp application.

## 1. Backend Architecture Overview
The backend is a Node.js/Express application using MongoDB (Mongoose ORM).
- **Base URL for Android Emulator:** `http://10.0.2.2:5000/`
- **Authentication:** JWT (JSON Web Tokens) are used for securing endpoints.
- **Roles:** Users can be registered as `Donator`, `Organizer`, or `Admin`.
- **Verification:** Organizers must be verified (`is_verified: true` in user profile) by an admin before they can create campaigns.

## 2. API Endpoints Integrated

### Auth & User Verification
- `POST /register`: Registers a new Donator/Organizer. Returns JWT token.
- `POST /login`: Authenticates an existing user and returns JWT + User Profile.
- `POST /verify-email`: Verifies user email via OTP.
- `POST /auth/qr/scan`: Initiates a QR login session from the mobile app scanning the web.
- `POST /auth/qr/approve`: Approves the QR login session containing the mobile user's token.

### Campaigns
- `GET /campaigns/public/:id`: Fetches a single public campaign's details.
- `GET /campaigns/organizer`: Fetches all campaigns for the logged-in verified organizer.

### Donations
- `POST /donations`: Submits a donation (involves uploading photos of items/materials as proof of donation).

## 3. Frontend Implementation Details

### Setup & Dependencies
- `Retrofit2` & `OkHttp3` for REST networking.
- `Gson` for JSON serialization.
- `CameraX` & `ZXing` for QR code scanning.
- `androidx.security:security-crypto` for securely storing JWT tokens in SharedPreferences via `TokenManager`.

### Architecture Pattern
The app uses an **MVVM (Model-View-ViewModel)** architecture:
- **Models:** Data classes matching API responses (`UserProfile`, `Campaign`, `AuthResponse`).
- **Repositories:** Classes abstracting API calls and managing tokens (`AuthRepository`, `CampaignRepository`, `QrAuthRepository`).
- **ViewModels:** Managing UI state (`AuthViewModel`, `HomeFeedViewModel`, `QrViewModel`).
- **Compose Screens:** Consuming state flows inside the `ui/screens` package.

## 4. Fully Wired Workflows

### 4.1 Login & Signup Flow (`AuthViewModel`, `LoginSignupScreen`, `OTPVerificationScreen`)
- Users select a role (`Donator` or `Organizer`).
- On successful registration, users are redirected to `OTPVerificationScreen`.
- Once OTP is verified (via `/verify-email`), the user profile is fetched, JWT is saved securely via `TokenManager`, and the user is redirected to the `HomeFeedScreen` or `OrganizerDashboardScreen`.

### 4.2 Organizer Dashboard (`OrganizerDashboardViewModel`, `OrganizerDashboardScreen`)
- The backend requires Organizers to be explicitly verified.
- The `is_verified` boolean from `UserProfile` determines what the Organizer sees.
- **Unverified State:** A pending screen requesting the organizer to submit verification documents (endpoint TBD).
- **Verified State:** A dashboard loading their active campaigns via `GET /campaigns/organizer`.

### 4.3 QR Code Login (`QrViewModel`, `QRLoginScreen`)
- Added a floating QR action button in the top right of the `HomeFeedScreen`.
- Uses CameraX to analyze frames in real-time with ZXing to decode the QR text (which contains the `sessionId`).
- Once scanned, calls `/auth/qr/scan` to validate. The UI shifts to an approval dialog.
- On approval, `/auth/qr/approve` securely sends the user's mobile JWT token back to the server to establish the web session.

### 4.4 Campaign Details (`CampaignDetailsViewModel`, `DetailsScreen`)
- Fetches individual campaign structures based on the `itemId` passed in navigation arguments.
- Safely casts values for goal UI progress tracking.

## 5. Next Steps & Known Blockers
- **Donation Materials Submissions:** The system needs an interface to allow donators to take pictures of in-kind donations and submit them to `/donations`. This requires a multipart request configuration in Retrofit.
- **Organizer Verification Flow:** Organizers need a formal form to submit physical documents in the `OrganizerDashboardScreen`. The corresponding endpoint `/organizers/verify_request` needs to be finalized on the backend.
- **End-to-End Testing:** Developers should test the flows locally by connecting their emulator to the running local Express server and validating logs in Logcat under tag `OkHttp`.
