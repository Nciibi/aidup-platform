package com.aidup.app.models.auth

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /auth/login
// Backend reads: email, password, role  (role is optional — defaults to searching all collections)
// role must be "Donator" or "Organizer" (backend does role.toUpperCase() internally)
data class LoginRequest(
    val email: String,
    val password: String,
    val role: String        // "Donator" or "Organizer"
)

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /auth/register
// Backend reads: name, email, password, phoneNumber, role
// photo is handled as a multipart upload by the backend middleware (req.uploadedFile),
// so it is NOT sent as a JSON field — removed from this data class.
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String, // "Donator" or "Organizer"
    val phoneNumber: String? = null // optional
)

// ─── Google Login ─────────────────────────────────────────────────────────────
// POST /auth/google-login
// Backend reads: credential (the raw Google ID token), role
data class GoogleLoginRequest(
    val credential: String, // the raw Google ID token (idToken)
    val role: String        // "Donator" or "Organizer"
)

// ─── OTP / Email Verification ─────────────────────────────────────────────────
// POST /auth/verify-registration-email
// Backend reads: email, code
data class VerifyEmailRequest(
    val email: String,
    val code: String
)

// ─── QR Login ─────────────────────────────────────────────────────────────────
// POST /auth/qr/approve
// Backend reads: sessionId  (from req.body)
data class QrApproveRequest(
    val sessionId: String
)

// ─── Shared user profile returned inside AuthResponse ─────────────────────────
// Backend returns the full Mongoose document as "userinfo".
// Only the fields the app actually needs are mapped here — extras are ignored by Gson.
data class UserProfile(
    val _id: String,
    val name: String,
    val email: String,
    val role: String,
    val photo: String? = null,          // backend field is "photo", not "image"
    val is_verified: Boolean? = null,   // present on Organizer documents (true = verified)
    val username: String? = null,
    val phoneNumber: String? = null // Added for broader support
)

// ─── Refresh Token ────────────────────────────────────────────────────────────
// POST /auth/refresh
data class RefreshRequest(
    val refreshToken: String
)

// ─── Auth response ────────────────────────────────────────────────────────────
// All auth endpoints (login, register-verify, google-login, refresh) respond with this shape:
//   { success, message, accessToken, refreshToken, tokenType, expiresIn, userinfo }
// "userinfo" is the full user document.
data class AuthResponse(
    val success: Boolean,
    val message: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,   // Added for mobile support
    val tokenType: String? = null,      // always "Bearer"
    val expiresIn: String? = null,
    val userinfo: UserProfile? = null   // backend always uses "userinfo"
)

// ─── Generic API response ─────────────────────────────────────────────────────
// Used for endpoints that only return { success, message }
data class ApiResponse(
    val success: Boolean,
    val message: String? = null
)

// ─── QR session creation response ─────────────────────────────────────────────
// POST /auth/qr/create  →  { success, sessionId, qrUrl, expiresAt }
data class QrSessionResponse(
    val success: Boolean,
    val sessionId: String? = null,
    val qrUrl: String? = null,
    val expiresAt: String? = null
)
