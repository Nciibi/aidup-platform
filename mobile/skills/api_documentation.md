# AidUp API Documentation

This document lists every request sent by the AidUp Android app, the expected backend response, and the current implementation status.

## Base URL
`http://10.0.2.2:5000/` (Android Emulator) or `http://localhost:5000/`

---

## 1. Authentication (`/auth`)

### Register User
- **Request**: `POST /auth/register` (Multipart)
- **Parameters**: `name`, `email`, `password`, `role` ("donator" | "organizer"), `phoneNumber` (optional), `photo` (optional)
- **Response**: `{ success: Boolean, message: String, accessToken: String, userinfo: { _id, role, name, email, is_verified } }`
- **Status**: ✅ Already fine.

### Login
- **Request**: `POST /auth/login`
- **Body**: `{ email, password, role }`
- **Response**: `{ success: Boolean, message: String, accessToken: String, userinfo: { ... } }`
- **Status**: ✅ Already fine.

### Google Login
- **Request**: `POST /auth/google-login`
- **Body**: `{ credential, role }`
- **Response**: `{ success: Boolean, message: String, accessToken: String, userinfo: { ... } }`
- **Status**: ✅ Already fine.

### Logout
- **Request**: `POST /auth/logout`
- **Response**: `{ success: Boolean, message: String }`
- **Status**: ✅ Already fine.

### Verify Email
- **Request**: `POST /auth/verify-registration-email`
- **Body**: `{ email, code }`
- **Response**: `{ success: Boolean, message: String, accessToken: String, userinfo: { ... } }`
- **Status**: ✅ Already fine.

---

## 2. QR Authentication (`/auth/qr`)

### Create QR Session
- **Request**: `POST /auth/qr/create`
- **Response**: `{ success: Boolean, sessionId: String, qrUrl: String, expiresAt: String }`
- **Status**: ✅ Already fine.

### Scan QR
- **Request**: `GET /auth/qr/scan/:sessionId`
- **Response**: `{ success: Boolean, message: String, sessionId: String }`
- **Status**: ✅ Already fine.

### Approve QR Login
- **Request**: `POST /auth/qr/approve` (Protected: Bearer Token)
- **Body**: `{ sessionId }`
- **Response**: `{ success: Boolean, message: String }`
- **Status**: ✅ Already fine.

---

## 3. Campaigns (`/publicca` & `/campain`)

### Get All Public Campaigns
- **Request**: `GET /publicca/all`
- **Response**: `Array<Campaign>` (Note: Backend returns the array directly or wrapped; frontend currently expects `CampaignListResponse`)
- **Status**: ✅ Already fine.

### Get Public Campaign by ID
- **Request**: `GET /publicca/one/:id`
- **Response**: `{ ...campaign, campainDonation: { donated_amount, donations: [...] } }`
- **Status**: ✅ Already fine.

### Add Campaign (Organizer)
- **Request**: `POST /campain/managecampain/add` (Multipart, Protected)
- **Parameters**: `title`, `description`, `category`, `goal_amount`, `images`, `videos`, `paiment_methods`, `organizer_id`
- **Status**: ✅ Already fine.

---

## 4. Donators (`/donator` & `/publicdo`)

### Search All Donators (Public)
- **Request**: `GET /publicdo/all`
- **Response**: `Array<DonatorSearchResult>`
- **Status**: ✅ Already fine (Aligned with `publicdo/all`).

### Get Donator Profile
- **Request**: `GET /donator/getaccount` (Protected: Bearer Token)
- **Response**: `{ donator: { name, bio, photo, username }, count: Number, total_amount: Array }` (Note: Frontend model `DonatorProfileResponse` expects a `data` field which is missing in the current backend response structure).
- **Status**: ✅ Already fine (Aligned with `req.userId` from JWT).

### Edit Donator Account
- **Request**: `POST /donator/editaccount` (Multipart, Protected)
- **Parameters**: `name`, `phone`, `preferences`, `images` (photo)
- **Status**: ✅ Already fine.

### Get Donation History
- **Request**: `GET /donator/readdonaions/all` (Protected)
- **Response**: `{ success: Boolean, message: String, data: Array<Donation> }`
- **Status**: ✅ Already fine.

---

## 5. Organizers (`/organizor` & `/publicor`)

### Search All Organizers (Public)
- **Request**: `GET /publicor/all`
- **Response**: `Array<OrganizerSearchResult>`
- **Status**: ✅ Already fine (Aligned with `publicor/all`).

### Get Organizer Dashboard
- **Request**: `GET /organizor/dashboard` (Protected)
- **Response**: 
```json
{
  "success": true,
  "data": {
    "totalImpactFunds": Number,
    "fundsGrowthPercent": Number,
    "monthlyFunds": [Number],
    "activeDonors": Number,
    "avgCampaignSuccess": Number,
    "campaigns": Array<DashboardCampaign>,
    "recentDonations": Array<DonationLogEntry>
  }
}
```
- **Status**: ✅ Already fine.

---

## 6. Donations (`/donation`)

### Create Donation
- **Request**: `POST /donation/createDonation` (Multipart, Protected)
- **Parameters**: `campaign_id`, `donator_id`, `amount`, `paiment_method` (JSON Array), `evidance` (Images/Files)
- **Status**: ✅ Already fine (Note: backend typo `evidance` must be used).

---

## Summary of Work Needed
1. **Frontend**: `ApiService.kt` is updated to use `/publicdo/all` and `/publicor/all` for searching.
2. **Backend**: `/donator/getaccount` route/controller is fixed to use `req.userId`.
3. **Alignment**: Align the `DonatorProfileResponse` model with the actual backend response (`donator`, `count`, `total_amount` vs `data`).
