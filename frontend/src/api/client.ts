// ─── Axios Client ───────────────────────────────────────────────────────────
// Replaces: RetrofitClient.kt + TokenAuthenticator.kt
// - Request interceptor: attaches Authorization header
// - Response interceptor: auto-refreshes expired JWT tokens

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '../utils/token';
import type { AuthResponse } from '../types/auth.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ──────────────────────────────
// Mirrors the logic in Kotlin TokenAuthenticator: only refresh on JWT-specific
// 401 errors, not on business-logic 401s (e.g. "Organizer not verified").
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Check if this is a token-related 401 (not a business logic 401)
    const responseText = JSON.stringify(error.response?.data || '');
    const isTokenError =
      responseText.includes('Invalid token') ||
      responseText.includes('Token has expired') ||
      responseText.includes('No token provided') ||
      responseText.includes('Not an access token');

    if (!isTokenError) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (originalRequest._retry) {
      tokenManager.clearAll();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request until refresh completes
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      // Use a plain axios call to avoid interceptor loops (mirrors plainOkHttpClient)
      const { data } = await axios.get<AuthResponse>(`${BASE_URL}/refresh/refresh`, {
        headers: { 'x-refresh-token': refreshToken },
      });

      if (data.accessToken) {
        tokenManager.saveToken(data.accessToken);
        if (data.refreshToken) {
          tokenManager.saveRefreshToken(data.refreshToken);
        }
        onRefreshed(data.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      }
      throw new Error('No access token in refresh response');
    } catch {
      tokenManager.clearAll();
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
