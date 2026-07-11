// ─── Auth API ───────────────────────────────────────────────────────────────
// Replaces: AuthRepository.kt + QrAuthRepository.kt
// Maps all auth endpoints from ApiService.kt

import apiClient from './client';
import { tokenManager } from '../utils/token';
import type {
  LoginRequest,
  GoogleLoginRequest,
  VerifyEmailRequest,
  AuthResponse,
  ApiResponse,
  QrSessionResponse,
  QrApproveRequest,
} from '../types/auth.types';

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', request);
    if (data.success && data.accessToken) {
      tokenManager.saveToken(data.accessToken);
      if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
      if (data.userinfo) {
        tokenManager.saveUser(
          data.userinfo._id,
          data.userinfo.role,
          data.userinfo.name,
          data.userinfo.email,
          data.userinfo.is_verified
        );
      }
    }
    return data;
  },

  async register(formData: FormData): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.success) {
      if (data.accessToken) tokenManager.saveToken(data.accessToken);
      if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
      if (data.userinfo) {
        tokenManager.saveUser(
          data.userinfo._id,
          data.userinfo.role,
          data.userinfo.name,
          data.userinfo.email,
          data.userinfo.is_verified
        );
      }
    }
    return data;
  },

  async googleLogin(request: GoogleLoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/google-login', request);
    if (data.success && data.accessToken) {
      tokenManager.saveToken(data.accessToken);
      if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
      if (data.userinfo) {
        tokenManager.saveUser(
          data.userinfo._id,
          data.userinfo.role,
          data.userinfo.name,
          data.userinfo.email,
          data.userinfo.is_verified
        );
      }
    }
    return data;
  },

  async verifyEmail(request: VerifyEmailRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/verify-registration-email', request);
    if (data.success && data.accessToken) {
      tokenManager.saveToken(data.accessToken);
      if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
      if (data.userinfo) {
        tokenManager.saveUser(
          data.userinfo._id,
          data.userinfo.role,
          data.userinfo.name,
          data.userinfo.email,
          data.userinfo.is_verified
        );
      }
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/auth/logout');
    } catch {
      // Always clear local state even if server logout fails
    }
    tokenManager.clearAll();
  },

  async adminLogin(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/admin/admin-login', request);
    if (data.success && data.accessToken) {
      tokenManager.saveToken(data.accessToken);
      if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
      if (data.userinfo) {
        tokenManager.saveUser(
          data.userinfo._id,
          data.userinfo.role,
          data.userinfo.name,
          data.userinfo.email,
          data.userinfo.is_verified
        );
      }
    }
    return data;
  },

  // ── QR Login ────────────────────────────────────────────────────────────
  async createQrSession(): Promise<QrSessionResponse> {
    const { data } = await apiClient.post<QrSessionResponse>('/auth/qr/create');
    return data;
  },

  async scanQrSession(sessionId: string): Promise<ApiResponse> {
    const { data } = await apiClient.get<ApiResponse>(`/auth/qr/scan/${sessionId}`);
    return data;
  },

  async approveQrSession(sessionId: string): Promise<ApiResponse> {
    const { data } = await apiClient.post<ApiResponse>('/auth/qr/approve', {
      sessionId,
    } as QrApproveRequest);
    return data;
  },
};
