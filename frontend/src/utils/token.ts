// ─── Token Manager ──────────────────────────────────────────────────────────
// Web equivalent of Android's EncryptedSharedPreferences (TokenManager.kt)
// NOTE: localStorage is NOT encrypted. For production, consider httpOnly cookies
// or a more secure token storage mechanism.

const KEYS = {
  ACCESS_TOKEN: 'aidup_access_token',
  REFRESH_TOKEN: 'aidup_refresh_token',
  USER_ID: 'aidup_user_id',
  USER_ROLE: 'aidup_user_role',
  USER_NAME: 'aidup_user_name',
  USER_EMAIL: 'aidup_user_email',
  USER_IS_VERIFIED: 'aidup_user_is_verified',
  DARK_MODE: 'aidup_dark_mode',
  REJECTION_TIMESTAMP: 'aidup_rejection_timestamp',
} as const;

export const tokenManager = {
  // ── Access Token ────────────────────────────────────────────────────────
  saveToken(token: string) {
    localStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },
  getToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  },
  clearToken() {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
  },

  // ── Refresh Token ───────────────────────────────────────────────────────
  saveRefreshToken(token: string) {
    localStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  },
  clearRefreshToken() {
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
  },

  // ── User Info ───────────────────────────────────────────────────────────
  saveUser(id: string, role: string, name: string, email: string, isVerified?: boolean | null) {
    localStorage.setItem(KEYS.USER_ID, id);
    localStorage.setItem(KEYS.USER_ROLE, role);
    localStorage.setItem(KEYS.USER_NAME, name);
    localStorage.setItem(KEYS.USER_EMAIL, email);
    if (isVerified != null) {
      localStorage.setItem(KEYS.USER_IS_VERIFIED, String(isVerified));
    } else {
      localStorage.removeItem(KEYS.USER_IS_VERIFIED);
    }
  },

  saveProfileInfo(name: string, role: string) {
    localStorage.setItem(KEYS.USER_NAME, name);
    localStorage.setItem(KEYS.USER_ROLE, role);
  },

  getUserId(): string | null {
    return localStorage.getItem(KEYS.USER_ID);
  },
  getUserRole(): string | null {
    return localStorage.getItem(KEYS.USER_ROLE);
  },
  getUserName(): string | null {
    return localStorage.getItem(KEYS.USER_NAME);
  },
  getUserEmail(): string | null {
    return localStorage.getItem(KEYS.USER_EMAIL);
  },
  isVerifiedOrganizer(): boolean {
    return localStorage.getItem(KEYS.USER_IS_VERIFIED) === 'true';
  },

  // ── Session ─────────────────────────────────────────────────────────────
  isLoggedIn(): boolean {
    return this.getToken() !== null || this.getRefreshToken() !== null;
  },
  clearAll() {
    Object.values(KEYS).forEach((key) => {
      if (key !== KEYS.DARK_MODE) localStorage.removeItem(key);
    });
  },

  // ── Dark Mode ───────────────────────────────────────────────────────────
  getDarkMode(): boolean {
    return localStorage.getItem(KEYS.DARK_MODE) === 'true';
  },
  setDarkMode(value: boolean) {
    localStorage.setItem(KEYS.DARK_MODE, String(value));
  },

  // ── Rejection Timestamp (replaces DataStoreManager) ─────────────────────
  getRejectionTimestamp(): number | null {
    const val = localStorage.getItem(KEYS.REJECTION_TIMESTAMP);
    return val ? Number(val) : null;
  },
  saveRejectionTimestamp(timestamp: number) {
    localStorage.setItem(KEYS.REJECTION_TIMESTAMP, String(timestamp));
  },
  clearRejectionTimestamp() {
    localStorage.removeItem(KEYS.REJECTION_TIMESTAMP);
  },
};
