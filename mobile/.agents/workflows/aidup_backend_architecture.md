---
description: AidUp Backend Architecture and Frontend Implementation Plan
---

# AidUp Architecture & Skills Analysis

This document outlines the learned capabilities of the `aidup-backend` API and establishes a comprehensive frontend implementation plan utilizing the established "Living Sanctuary" UI theme via Stitch MCP.

## 1. Backend Architecture Understanding
Based on the provided Node.js/Express repository (`C:\Users\ncibi\Desktop\aidup-backend`), the backend operates on the following architecture:

*   **Technology Stack**: Node.js, Express.js REST API, MongoDB Database (Mongoose Schemas).
*   **Authentication & Security**:
    *   **Tokens**: Dual-token system (15m Access Token in response body, 7d Refresh Token in `httpOnly` cookie).
    *   **Multi-Factor Auth (MFA)**: TOTP via QR Code setup and token verification routes.
    *   **QR Login**: Real-time cross-device authentication using WebSocket (`socket.io`).
    *   **OAuth**: Google account login handling.
*   **Core Entities**:
    *   `donator` / `organizer`: Two distinct user roles with different capabilities.
    *   `campaign`: Crowdfunding campaigns with statuses (`pending`, `approved`, `rejected`), funding goals, progress, and categorical tracking.
    *   `donation` / `campaindonation`: Transaction records bridging donators and campaigns.
    *   `admin`: Superuser role responsible for system moderation and verifying organizers/campaigns.
*   **API Modules**:
    1.  **Auth Module**: Registration, login, MFA, and email verification.
    2.  **Public Data**: Read-only browsing of campaigns and organizers.
    3.  **Campaign Management**: Organizer-specific routes for CRUD operations on campaigns (including multimodal image/video uploads).
    4.  **Account Management**: Profile updates and deletions.
    5.  **Donations**: Donator-specific routes to browse donation history (approved, pending, rejected).
    6.  **Admin Panel**: Content moderation (approval processes) and audit logging.

## 2. Required Frontend Pages (Android Compose)
To provide full coverage of the backend functionality, the following new screens must be implemented in the Kotlin app:

### Authentication & Onboarding Flow
*   [x] **Login & Registration** (Already aligned to Stitch)
*   [ ] **Email Verification Screen**: 6-digit OTP input interface.
*   [ ] **Password Reset Flow**: Forgot Password request & New Password submission screens.
*   [ ] **MFA Setup & Verification**: QR Code display (for setup) and TOTP 6-digit input.
*   [ ] **QR Code Scanner**: Cross-device login scanner.

### Public Directory
*   [x] **Home Feed** (Already aligned to Stitch)
*   [ ] **Campaign Details Screen**: Media carousel (images/videos), funding progress bar, "Donate Now" CTA, and organizer info pane.
*   [ ] **Organizer Public Profile**: View of an organizer's verified status and list of their active campaigns.

### Donator Dashboard
*   [ ] **Donation Checkout Flow**: Payment method selection and donation submission form.
*   [ ] **Donation History**: Tabbed list view showing approved, pending, and rejected donation records.
*   [ ] **Donator Profile Edit**: Screen to update personal details and avatar.

### Organizer Dashboard
*   [ ] **Campaign Creation Stepper**: Multi-step form to upload media, set descriptions, define goals, and choose categories.
*   [ ] **Organizer Dashboard Hub**: Analytics view of currently managed campaigns, funds raised, and status badges (pending/approved).
*   [ ] **Organizer Verification Screen**: Interface to submit documents for Admin vetting.
*   [ ] **Organizer Profile Edit**: Settings view to manage organization specifics.

## 3. Stitch MCP Implementation Plan
To maintain pixel-perfect consistency with the newly established "Living Sanctuary" design language (Primary: `#003dd6`, Secondary: `#006e2a`, Tertiary: `#952b00`, Typography: `Manrope` / `Inter`), we will execute the following workflow for all new screens:

1.  **Prompt Stitch MCP**: For each required page, feed a highly specific prompt to Stitch MCP asking to generate the HTML for that specific domain. (e.g., *"Generate a mobile-first HTML design for a Donation Checkout page mimicking the AidUp design system..."*)
2.  **Extract the DOM**: Render and extract the HTML/CSS from Stitch MCP output, exactly as we did for the Home Feed.
3.  **Translate to Compose**: Directly map the generated layout structures (Cards, Surfaces, Containers, Inputs) into Kotlin `@Composable` functions.
4.  **Integrate API Data**: Wire the resulting UI to the corresponding `aidup-backend` REST endpoints using Retrofit, ensuring all secure calls pass the `Authorization: Bearer <token>` header.
