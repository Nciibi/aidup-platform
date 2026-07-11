# Data Models and State

## Core Models

### Legacy Models

`AidItem` is older sample content, not the main backend DTO anymore.

Fields:

- `id`
- `title`
- `description`
- `category`
- `categoryName`
- `imageUrl`
- `raisedAmount`
- `targetAmount`
- `isFeatured`
- `organizerName`

### `DonationCategory`

Enum values:

- `ALL`
- `HEALTH`
- `ANIMALS`
- `EDUCATION`
- `ENVIRONMENT`
- `EMERGENCY`
- `PEOPLE`
- `COUNTRIES`

### Auth Models

`LoginRequest`

- `email`
- `password`
- `role`

`RegisterRequest`

- `name`
- `email`
- `password`
- `role`
- `phoneNumber`

`GoogleLoginRequest`

- `credential`
- `role`

`VerifyEmailRequest`

- `email`
- `code`

`QrApproveRequest`

- `sessionId`

`UserProfile`

- `_id`
- `name`
- `email`
- `role`
- `photo`
- `is_verified`
- `username`

`AuthResponse`

- `success`
- `message`
- `accessToken`
- `tokenType`
- `expiresIn`
- `userinfo`

`QrSessionResponse`

- `success`
- `sessionId`
- `qrUrl`
- `expiresAt`

### Campaign Models

`Campaign`

- `_id`
- `title`
- `description`
- `category`
- `goal_amount`
- `raised_amount`
- `images`
- `status`
- `organizer_id`
- `banner`
- `story`
- `goals`
- `donors_count`
- `days_left`
- `impact`
- `organizer_name`
- `organizer_photo`
- `top_donors`

`Donor`

- `name`
- `photo`
- `amount`
- `time`

`CampaignListResponse`

- `success`
- `campains`

`CampaignResponse`

- `success`
- `campain`

### Donation Models

`PaymentMethod`

- `type`
- `details`

`CampaignInfo`

- `_id`
- `title`

`Donation`

- `_id`
- `campaign_id`
- `donator_id`
- `amount`
- `payment_methods`
- `evidence_images`
- `status`
- `submitted_at`
- `verified_at`

`DonationListResponse`

- `success`
- `message`
- `data`

### Profile Models

`DonatorProfileResponse`

- `success`
- `message`
- `data`

`DonatorData`

- `id`
- `name`
- `email`
- `phone`
- `profilePicture`
- `role`
- `preferences`
- `createdAt`

## Repository Contracts

### AuthRepository

Methods present:

- `login(request)`
- `register(request)`
- `googleLogin(request)`
- `logout()`
- `verifyEmail(email, code)`

Responsibilities:

- auth networking
- token persistence
- user metadata persistence

### CampaignRepository

Methods:

- `getPublicCampaigns()`
- `getPublicCampaignById(id)`
- `getOrganizerCampaigns()`

### DonationRepository

Methods:

- `submitDonationEvidence(campaignId, donatorId, amount, paymentMethods, evidenceImages)`
- `getDonationHistory(status)`

### ProfileRepository

Methods:

- `getDonatorProfile()`
- `updateDonatorProfile(name, phone, preferencesJson, imagePart)`
- `getDonationHistory()`

### QrAuthRepository

Methods:

- `createSession()`
- `scanSession(sessionId)`
- `approveSession(sessionId)`

## View Model Contracts

### AuthViewModel

State:

- `Idle`
- `Loading`
- `Success(user)`
- `Error(message)`

Handlers:

- `login(request)`
- `register(name, email, password, role, phoneNumber, photo)`
- `googleLogin(idToken, role)`
- `verifyEmail(email, code)`
- `logout()`
- `resetState()`

### HomeFeedViewModel

State:

- `Loading`
- `Success(campaigns)`
- `Error(message)`

Handler:

- `loadCampaigns()`

### CampaignDetailsViewModel

State:

- `Loading`
- `Success(campaign)`
- `Error(message)`

Handler:

- `loadCampaign(id)`

### DonationViewModel

History state:

- `Loading`
- `Success(donations)`
- `Error(message)`

Submit state:

- `Idle`
- `Submitting`
- `Success`
- `Error(message)`

Handlers:

- `loadHistory(statusFilter)`
- `submitEvidence(context, campaignId, amount, paymentMethods, imageUris)`
- `resetSubmitState()`

### SearchViewModel

State:

- `donators`
- `organizers`
- `isLoadingDonators`
- `isLoadingOrganizers`

Handlers:

- `searchDonators(query)`
- `searchOrganizers(query)`

### QrViewModel

State:

- `Idle`
- `Scanning`
- `Validating`
- `AwaitingApproval(sessionId)`
- `Approved`
- `Error(message)`

Handlers:

- `startScan()`
- `onQrScanned(rawValue)`
- `approveLogin(sessionId)`
- `resetState()`

### UserProfileViewModel

State fields:

- `isLoading`
- `profileData`
- `donationHistory`
- `errorMessage`
- `totalDonated`
- `campaignsSupported`

Handlers present:

- `loadProfileData()`
- `updateProfilePicture(imagePart)`

### OrganizerDashboardViewModel

State:

- `Loading`
- `Success(data)`
- `Error(message)`

Dashboard data expected:

- `totalImpactFunds`
- `fundsGrowthPercent`
- `monthlyFunds`
- `activeDonors`
- `avgCampaignSuccess`
- `campaigns`
- `recentDonations`

Handler:

- `loadDashboard()`
