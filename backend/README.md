# AidUp Backend - API Documentation 🚀

Welcome to the AidUp Backend API documentation. This document is designed to help frontend developers integrate with our authentication and security services.

## Base URL
`http://localhost:5000` (or your local environment port)

## Authentication Logic
- **Access Tokens**: Short-lived (15m), sent in the response body as `accessToken`.
- **Refresh Tokens**: Long-lived (7d), sent as an `httpOnly` cookie named `jwt`.
- **Protected Routes**: Require the `Authorization` header: `Bearer <your_access_token>`.

---

## 1. Authentication Core

### User Registration
`POST /auth/register`

Handles registration for both **Donators** and **Organizers**. *(Note: Postman requires `form-data` if uploading an image).*

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Min 2 characters. |
| `email` | String | Yes | Valid email address. |
| `password` | String | Yes | Min 12 chars (Upper, Lower, Num, Special). |
| `role` | String | Yes | "donator" or "organizer". |
| `phoneNumber` | String | No | E.164 format. |
| `image` | File | No | Profile picture file. |

**JSON Request Example (if no image):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "donator"
}
```

**JSON Response Example (Success 201):**
```json
{
  "success": true,
  "message": "Verification email sent. Please verify your account.",
  "data": {
    "email": "john@example.com"
  }
}
```

---

### Email/Password Login
`POST /auth/login`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User email. |
| `password` | String | Yes | User password. |
| `role` | String | No | "donator", "organizer", or omitted. |

**JSON Request Example:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**JSON Response Example (Success 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": "15m",
  "userinfo": {
    "id": "64bc1...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donator"
  }
}
```

**JSON Response Example (MFA Required 200):**
```json
{
  "success": true,
  "message": "MFA required",
  "mfaRequired": true,
  "mfaToken": "temp_jwt_token_for_mfa"
}
```

---

### Google OAuth Login
`POST /auth/google-login`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `credential` | String | Yes | Google ID token from frontend. |
| `role` | String | Yes | "donator" or "organizer". |
⚠️ **Remark:** role is only provided when the user is not registered yet.
**JSON Request Example:**
```json
{
  "credential": "YOUR_GOOGLE_ID_TOKEN",
  "role": "donator"
}
```

**JSON Response Example (Success 200/201):**
```json
{
  "success": true,
  "message": "Google login successful",
  "accessToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": "15m",
  "userinfo": {
    "id": "64bc1...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donator"
  }
}
```

---

## 2. Multi-Factor Authentication (MFA)

### MFA Setup (Get QR Code)
`POST /auth/mfa/setup`
*Requires Login Authorization Header.*

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | Header | Yes | `Bearer <your_access_token>` |

**JSON Request Example:**
```json
{}
```

**JSON Response Example:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..." 
}
```

---

### MFA Verify (Enable)
`POST /auth/mfa/verify`
*Requires Login Authorization Header.*

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | Header | Yes | `Bearer <your_access_token>` |
| `token` | String | Yes | 6-digit TOTP code from app. |

**JSON Request Example:**
```json
{
  "token": "123456"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "MFA enabled successfully"
}
```

---

### MFA Disable
`POST /auth/mfa/disable`
*Requires Login Authorization Header.*
- Disables MFA for the user.

---

### MFA Verify Login (Finalize Login)
`POST /auth/mfa/verify-login`
*Used to provide the 2FA code during login.*

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mfaToken` | String | Yes | The temporary token from `/login` response. |
| `code` | String | Yes | 6-digit TOTP code from app. |

**JSON Request Example:**
```json
{
  "mfaToken": "temp_jwt_token_for_mfa",
  "code": "123456"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Login successful via MFA",
  "accessToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": "15m",
  "userinfo": {
    "id": "64bc1...",
    "email": "john@example.com",
    "role": "donator"
  }
}
```

---

## 3. Email Verification

### Verify Registration Code
`POST /auth/verify-registration-email`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User email. |
| `code` | String | Yes | 6-digit code sent via email. |

**JSON Request Example:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Account verified and created successfully",
  "userinfo": {
    "id": "64bc1...",
    "email": "john@example.com",
    "role": "donator"
  }
  "accessToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

---

### Additional Verification Routes
- `POST /auth/resend-registration-verification` - Resend verification email.
- `POST /auth/send-code` - Send MFA/Email verification code.
- `POST /auth/verify-code` - Verify the sent code.
- `GET /auth/verification-status/:email` - Check verification status.

---

## 4. Password Management

### Forgot Password
`POST /auth/forgot-password`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User email. |

**JSON Request Example:**
```json
{
  "email": "john@example.com"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Password reset link sent"
}
```

---

### Reset Password
`POST /auth/reset-password`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `token` | String | Yes | Token retrieved from the email link. |
| `newPassword` | String | Yes | New secure password. |

**JSON Request Example:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "SecurePassword123!"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 5. Session Management

### Refresh Token
`GET /auth/refresh`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Cookie` | Header | Yes | Requires `jwt=REFRESH_TOKEN` to be attached. |

**JSON Request Example:**
```json
{}
```

**JSON Response Example:**
```json
{
  "accessToken": "new_eyJhbG..."
}
```

---

### Logout
`POST /auth/logout`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Cookie` | Header | Yes | Requires `jwt=REFRESH_TOKEN` to be attached. |

**JSON Request Example:**
```json
{}
```

**JSON Response Example:**
```json
{
  "message": "Cookie cleared"
}
```

---

## 6. Error Responses

Common error structure returned when validations fail or tokens expire.

**JSON Response Example (Error 400/401/409/500):**
```json
{
  "success": false,
  "message": "Descriptive error message here",
  "stack": "..." 
}
```

---

## 7. QR Code Login 📱

This feature allows a PC browser to log in by having a logged-in mobile device scan a dynamically generated QR code.

### 7.1 Create QR Session (PC)
`POST /auth/qr/create`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| None | - | - | - |

**JSON Response Example:**
```json
{
  "success": true,
  "sessionId": "ccf0fb9c-0bfb-4f07-afa7-6252f54b4ec8",
  "qrUrl": "/auth/qr/scan/ccf0fb9c-0bfb-4f07-afa7-6252f54b4ec8",
  "expiresAt": "2026-03-15T15:10:00.000Z"
}
```

---

### 7.2 Scan QR Code (Phone)
`GET /auth/qr/scan/:sessionId`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | String | Yes | Path parameter. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Session is valid. Waiting for approval.",
  "sessionId": "ccf0fb9c-0bfb-4f07-afa7-6252f54b4ec8"
}
```

---

### 7.3 Approve QR Login (Phone)
`POST /auth/qr/approve`
*Requires Login Authorization Header on the phone app.*

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | Header | Yes | `Bearer <phone_access_token>` |
| `sessionId` | String | Yes | The session ID from the QR code. |

**JSON Request Example:**
```json
{
  "sessionId": "ccf0fb9c-0bfb-4f07-afa7-6252f54b4ec8"
}
```

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Login approved successfully. PC will proceed automatically."
}
```

---

### 7.4 Monitor QR Status (PC Fallback)
`GET /auth/qr/status/:sessionId`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | String | Yes | Path parameter. |

**JSON Response Example:**
```json
{
  "success": true,
  "status": "pending"
}
```

---

### 7.5 WebSocket Event (PC)
The PC browser should connect to the socket server and join a room named with the `sessionId` to receive the final tokens.

- **Join Room**: `socket.emit('qr:join-session', sessionId)`
- **Listen Event**: `qr:authenticated`
- **Payload Example**:
```json
{
  "success": true,
  "message": "Login approved",
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

---

## 8. Public Data Routes (Read-Only) 🌍

These routes are accessible to all users (logged-in or guests) to browse the platform's content.

### 8.1 Public Campaigns
`GET /publicca/all`

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Public campaigns fetched successfully",
  "data": [ { "title": "Sample Campaign", "description": "..." } ]
}
```

`GET /publicca/one/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Campaign ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign fetched successfully",
  "data": { "title": "Sample Campaign", "description": "...", "raised_amount": 100 }
}
```

---

### 8.2 Public Organizers
`GET /publicor/all`

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Public organizers fetched successfully",
  "data": [ { "name": "Alice", "email": "alice@example.com" } ]
}
```

`GET /publicor/one/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Organizer ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizer profile fetched successfully",
  "data": { "name": "Alice", "email": "alice@example.com" }
}
```

---

### 8.3 Public Donators
`GET /publicdo/all`

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Public donators fetched successfully",
  "data": [ { "name": "Bob", "public_info": "..." } ]
}
```

`GET /publicdo/one/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Donator ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donator profile fetched successfully",
  "data": { "name": "Bob", "donations_history": [] }
}
```

---

## 9. Campaign Management (Organizers) 📢

*Requires Login (ORGANIZER role).*

### Create Campaign
`POST /campain/managecampain/add`

**Request Body (form-data):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Campaign title. |
| `description` | String | Yes | Detailed description. |
| `category` | String | Yes | E.g., "Health", "Education". |
| `goal_amount` | Number | Yes | Target amount to raise. |
| `images` | Files | No | Up to 10 image files. |
| `videos` | Files | No | Up to 10 video files. |
| `paiment_methods` | Array | Yes | Accepted payment methods. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": { "_id": "...", "title": "Sample Campaign" }
}
```

### Update Campaign
`PUT /campain/managecampain/update/:id`

**Request Body (form-data):**
Same fields as Create Campaign, all optional.

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Campaign ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": { "_id": "...", "title": "Updated Campaign" }
}
```

### Delete Campaign
`DELETE /campain/managecampain/delete/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Campaign ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully",
  "data": { "_id": "..." }
}
```

---

## 10. Account Management (Organizer / Donator) 👤

### Organizer Info
*Requires Login (ORGANIZER role).*

`POST /organizor/editaccount`
**Request Body (form-data):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name`, `email`, etc. | String | No | Account fields to update. |
| `images`| File | No | Profile photo (max 1). |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor updated successfully",
  "data": { "_id": "...", "name": "Updated Name" }
}
```

`GET /organizor/getaccount`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor fetched successfully",
  "data": { "_id": "...", "name": "...", "email": "..." }
}
```

`DELETE /organizor/deleteaccount`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor deleted successfully",
  "data": { "_id": "..." }
}
```

`GET /organizor/dashboard`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": { "total_campaigns": 5, "total_raised": 5000 }
}
```

`GET /organizor/organizerSituation`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizer situation fetched",
  "data": { "is_verified": true, "status": "approved" }
}
```

`POST /organizor/submitVerification`
**Request Body (form-data):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `evidance` | File | Yes | Verification document (max 1). |
| `images` | Files | No | Additional images (max 5). |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Verification submitted successfully",
  "data": { "_id": "...", "status": "pending" }
}
```

### View My Campaigns
*Requires Login (ORGANIZER role).*

`GET /organizor/readcampains/all`
`GET /organizor/readcampains/all/approved`
`GET /organizor/readcampains/all/pending`
`GET /organizor/readcampains/all/rejected`

**JSON Response Example (for all variants):**
```json
{
  "success": true,
  "message": "Campains fetched successfully",
  "data": [ { "_id": "...", "title": "..." } ]
}
```

`GET /organizor/readcampains/one/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Campaign ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campain fetched successfully",
  "data": { "_id": "...", "title": "..." }
}
```

### Donator Info
*Requires Login (DONATOR role).*

`POST /donator/editaccount`
**Request Body (form-data):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name`, `email`, etc. | String | No | Account fields to update. |
| `photo` | File | No | Profile photo (max 1). |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor updated successfully",
  "data": { "_id": "...", "name": "Updated Name" }
}
```

`GET /donator/getaccount`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor fetched successfully",
  "data": { "_id": "...", "name": "...", "email": "..." }
}
```

`DELETE /donator/deleteaccount`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor deleted successfully",
  "data": { "_id": "..." }
}
```

---

## 11. Donation Management (Donators) 💰

*Requires Login (DONATOR role).*

### Make a Donation
`POST /donation/createDonation`

**Request Body (form-data):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `evidance` or `images` | File | Yes | Proof of payment. |
*(Additional required fields such as `amount`, `campainId`, etc. may be needed based on the schema).*

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donation created successfully",
  "data": { "_id": "...", "amount": 100, "status": "pending" }
}
```

---

### My Donations

`GET /donator/readdonaions/all`
`GET /donator/readdonaions/all/approved`
`GET /donator/readdonaions/all/pending`
`GET /donator/readdonaions/all/rejected`

**JSON Response Example (for all variants):**
```json
{
  "success": true,
  "message": "Donations fetched successfully",
  "data": [ { "_id": "...", "amount": 50, "status": "..." } ]
}
```

`GET /donator/readdonaions/one/:id`

**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Donation ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donation fetched successfully",
  "data": { "_id": "...", "amount": 50, "status": "..." }
}
```

---

## 12. Categories 🏷️

### Get All Categories
`GET /category/getall`

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [ { "_id": "...", "name": "Health" } ]
}
```

---

## 13. Administrative Panel 🛡️

*Requires Login (ADMIN role).*

### Authentication
`POST /admin/admin-login`

**Request Body (JSON):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | Admin email. |
| `password` | String | Yes | Admin password. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": { "admin": { "_id": "..." }, "token": "..." }
}
```

`GET /admin/refresh`
**JSON Response Example:**
```json
{
  "accessToken": "new_eyJhbG..."
}
```

`POST /admin/logout`
**JSON Response Example:**
```json
{
  "message": "Cookie cleared"
}
```

### Dashboard & Users
`GET /admin/admin/dashboard`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Welcome to the admin dashboard! ** dont do anything stupid plz :) **"
}
```

`GET /admin/getAllUsers`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": { "organizers": [], "donors": [] }
}
```

### Organizer Management
`GET /admin/all`
`GET /admin/getAllApprovedorganizors`
`GET /admin/getAllRejectedorganizors`
`GET /admin/getAllPendingorganizors`

**JSON Response Example (for all variants):**
```json
{
  "success": true,
  "message": "Organizors fetched successfully",
  "data": [ { "_id": "...", "name": "..." } ]
}
```

`GET /admin/getOrganizor/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Organizer ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor fetched successfully",
  "data": { "_id": "...", "name": "..." }
}
```

`PUT /admin/updateOrganizor/:id`
**Request Body:** JSON containing updated fields.

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor updated successfully",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteOrganizor/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Organizor deleted successfully",
  "data": { "_id": "..." }
}
```

### Donator Management
`GET /admin/getDonor/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Donor ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor fetched successfully",
  "data": { "_id": "..." }
}
```

`PUT /admin/updateDonor/:id`
**Request Body:** JSON containing updated fields.

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor updated successfully",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteDonor/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donor deleted successfully",
  "data": { "_id": "..." }
}
```

### Campaign Management & Verification
`GET /admin/getAllCampains`
`GET /admin/getAllPendingCampains`
`GET /admin/getAllApprovedCampains`
`GET /admin/getAllRejectedCampains`

**JSON Response Example (for all variants):**
```json
{
  "success": true,
  "message": "Campains fetched successfully",
  "data": [ { "_id": "...", "title": "..." } ]
}
```

`GET /admin/getCampainById/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Campaign ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campain fetched successfully",
  "data": { "_id": "..." }
}
```

`PUT /admin/updateCampain/:id`
**Request Body (form-data):** Updatable fields, `images` and `videos`.

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign updated by admin",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteCampain/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully",
  "data": { "_id": "..." }
}
```

### Organizer Verification Requests
`GET /admin/getAllVerifications`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Verifications fetched successfully",
  "data": [ { "_id": "...", "status": "pending" } ]
}
```

`GET /admin/getVerificationById/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Verification ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Verification fetched successfully",
  "data": { "_id": "..." }
}
```

`PUT /admin/updateVerification/:id`
**Request Body (JSON):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | String | Yes | "approved" or "rejected". |
| `review_comments` | String | No | Admin remarks. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Verification updated successfully",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteVerification/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Verification deleted successfully",
  "data": { "_id": "..." }
}
```

### Donation Management
`GET /admin/getAllDonations`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donations fetched successfully",
  "data": [ { "_id": "..." } ]
}
```

`GET /admin/getDonationById/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Donation ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donation fetched successfully",
  "data": { "_id": "..." }
}
```

`PUT /admin/updateDonation/:id`
**Request Body (JSON):** Fields to update (e.g. `status` to "approved").

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donation updated successfully",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteDonation/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Donation deleted successfully",
  "data": { "_id": "..." }
}
```

### Audit Logs
`GET /admin/getAllAuditLogs`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Audit logs fetched successfully",
  "data": [ { "_id": "...", "action": "..." } ]
}
```

`GET /admin/getAuditLogById/:id`
**Request Parameters:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Log ID. |

**JSON Response Example:**
```json
{
  "success": true,
  "message": "Audit log fetched successfully",
  "data": { "_id": "..." }
}
```

`DELETE /admin/deleteAuditLog/:id`
**JSON Response Example:**
```json
{
  "success": true,
  "message": "Audit log deleted successfully , hope ur not deleting this for a bad reason or hiding something :)",
  "data": { "_id": "..." }
}
```

