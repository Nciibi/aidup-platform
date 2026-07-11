// ─── Auth Types ─────────────────────────────────────────────────────────────
// Translated from: models/auth/AuthModels.kt

export interface LoginRequest {
  email: string;
  password: string;
  role: string; // "Donator" or "Organizer"
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
}

export interface GoogleLoginRequest {
  credential: string;
  role: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface QrApproveRequest {
  sessionId: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo?: string | null;
  is_verified?: boolean | null;
  username?: string | null;
  phoneNumber?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresIn?: string | null;
  userinfo?: UserProfile | null;
  // MFA fields from backend
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string | null;
}

export interface QrSessionResponse {
  success: boolean;
  sessionId?: string | null;
  qrUrl?: string | null;
  expiresAt?: string | null;
}
