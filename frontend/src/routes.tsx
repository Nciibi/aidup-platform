// ─── routes.tsx ─────────────────────────────────────────────────────────────
// Replaces: AidUpNavigation.kt
// Defines all application routes and role-based access control.

import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/guards/ProtectedRoute';

// Pages
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import QRLoginPage from './pages/QRLoginPage';

import HomeFeedPage from './pages/HomeFeedPage';
import AllCampaignsPage from './pages/AllCampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import DonationEvidencePage from './pages/DonationEvidencePage';
import DonationHistoryPage from './pages/DonationHistoryPage';
import SearchPage from './pages/SearchPage';

import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';

import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import CreateTabPage from './pages/CreateTabPage';
import VerificationPage from './pages/VerificationPage';

// Admin Pages
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrganizersPage from './pages/admin/AdminOrganizersPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // ── Public Routes (No Chrome by default in AppLayout) ─────────────────
      { index: true, element: <OnboardingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-email', element: <OTPVerificationPage /> },
      
      // QR Login acts as both public (if not logged in) or protected (if approving)
      { path: 'qr-login', element: <QRLoginPage /> },

      // Admin Login
      { path: 'admin/login', element: <AdminLoginPage /> },

      // ── Shared Protected Routes ───────────────────────────────────────────
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaign/:id',
        element: (
          <ProtectedRoute>
            <CampaignDetailPage />
          </ProtectedRoute>
        ),
      },

      // ── Donator Routes ────────────────────────────────────────────────────
      {
        path: 'home',
        element: (
          <ProtectedRoute requiredRole="donator">
            <HomeFeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaigns',
        element: (
          <ProtectedRoute requiredRole="donator">
            <AllCampaignsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'search',
        element: (
          <ProtectedRoute requiredRole="donator">
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'activity',
        element: (
          <ProtectedRoute requiredRole="donator">
            <DonationHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaign/:id/donate',
        element: (
          <ProtectedRoute requiredRole="donator">
            <DonationEvidencePage />
          </ProtectedRoute>
        ),
      },

      // ── Organizer Routes ──────────────────────────────────────────────────
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredRole="organizer">
            <OrganizerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute requiredRole="organizer">
            <CreateTabPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'verification',
        element: (
          <ProtectedRoute requiredRole="organizer">
            <VerificationPage />
          </ProtectedRoute>
        ),
      },

      // ── Fallback ──────────────────────────────────────────────────────────
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'organizers', element: <AdminOrganizersPage /> },
      { path: 'campaigns', element: <AdminCampaignsPage /> },
      { path: 'verifications', element: <AdminVerificationsPage /> },
      { path: 'donations', element: <AdminDonationsPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
    ],
  },
]);
