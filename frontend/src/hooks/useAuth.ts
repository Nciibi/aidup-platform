// ─── useAuth Hook ───────────────────────────────────────────────────────────
// Replaces: AuthViewModel.kt actions

import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import type { LoginRequest, GoogleLoginRequest, AuthResponse } from '../types/auth.types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  const handleAuthSuccess = (response: AuthResponse) => {
    if (response.userinfo) {
      setAuth(
        response.userinfo._id,
        response.userinfo.role,
        response.userinfo.name,
        response.userinfo.email,
        response.userinfo.is_verified
      );
    }
  };

  return {
    isLoading,
    error,
    clearError: () => setError(null),

    login: async (request: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.login(request);
        if (response.success) {
          if (response.mfaRequired) return { mfaRequired: true, mfaToken: response.mfaToken };
          handleAuthSuccess(response);
          return { success: true, role: response.userinfo?.role };
        }
        setError(response.message || 'Login failed');
        return { success: false };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Login failed');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },

    adminLogin: async (request: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.adminLogin(request);
        if (response.success) {
          handleAuthSuccess(response);
          return { success: true, role: response.userinfo?.role };
        }
        setError(response.message || 'Admin login failed');
        return { success: false };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Admin login failed');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },

    register: async (formData: FormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.register(formData);
        if (response.success) {
          handleAuthSuccess(response);
          return { success: true, message: response.message };
        }
        setError(response.message || 'Registration failed');
        return { success: false };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Registration failed');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },

    googleLogin: async (idToken: string, role: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const request: GoogleLoginRequest = { credential: idToken, role };
        const response = await authApi.googleLogin(request);
        if (response.success) {
          handleAuthSuccess(response);
          return { success: true, role: response.userinfo?.role };
        }
        setError(response.message || 'Google login failed');
        return { success: false };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Google login failed');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },

    verifyEmail: async (email: string, code: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.verifyEmail({ email, code });
        if (response.success) {
          handleAuthSuccess(response);
          return { success: true, role: response.userinfo?.role };
        }
        setError(response.message || 'Verification failed');
        return { success: false };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Verification failed');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },

    handleLogout: async () => {
      setIsLoading(true);
      try {
        await authApi.logout();
      } finally {
        logout();
        setIsLoading(false);
      }
    },
  };
}
