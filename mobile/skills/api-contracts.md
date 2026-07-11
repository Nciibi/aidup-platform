# API Contracts

Base URL configured in the app:

- `http://10.0.2.2:5000/`

Auth model:

- bearer token from `TokenManager`
- automatically attached by OkHttp interceptor when present

## Auth Routes

### `POST auth/register`

Transport:

- multipart

Expected request parts:

- `name: text/plain`
- `email: text/plain`
- `password: text/plain`
- `role: text/plain`
- `phoneNumber: text/plain` optional
- `photo: file` optional

Expected backend handler input:

- body fields: `name`, `email`, `password`, `role`, `phoneNumber`
- uploaded file: `photo`

App caller:

- `RegisterScreen` through `AuthViewModel.register(...)`

Expected response shape:

```json
{
  "success": true,
  "message": "string",
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "string",
  "userinfo": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "photo": "string|null",
    "is_verified": true,
    "username": "string|null"
  }
}
```

### `POST auth/login`

Expected JSON body:

```json
{
  "email": "string",
  "password": "string",
  "role": "Donator | Organizer"
}
```

Caller:

- `LoginScreen`

### `POST auth/logout`

Expected body:

- none

Caller:

- `AuthRepository.logout()`

### `POST auth/google-login`

Expected JSON body:

```json
{
  "credential": "google_id_token",
  "role": "Donator | Organizer"
}
```

Caller:

- `LoginScreen`

### `POST auth/verify-registration-email`

Expected JSON body:

```json
{
  "email": "string",
  "code": "string"
}
```

Caller:

- `OTPVerificationScreen`

## QR Login Routes

### `POST auth/qr/create`

Body:

- none

Response:

```json
{
  "success": true,
  "sessionId": "string",
  "qrUrl": "string",
  "expiresAt": "string"
}
```

### `GET auth/qr/scan/{sessionId}`

Input:

- route param `sessionId`

Response:

```json
{
  "success": true,
  "message": "string"
}
```

Caller:

- `QrViewModel.onQrScanned()`

### `POST auth/qr/approve`

Expected JSON body:

```json
{
  "sessionId": "string"
}
```

Caller:

- `QrViewModel.approveLogin()`

## Campaign Routes

### `GET publicca/all`

Body:

- none

Current DTO expects:

```json
{
  "success": true,
  "campains": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "goal_amount": 0,
      "raised_amount": 0,
      "images": ["string"],
      "status": "string",
      "organizer_id": "string",
      "banner": "string|null",
      "story": "string|null",
      "goals": ["string"],
      "donors_count": 0,
      "days_left": 0,
      "impact": "string|null",
      "organizer_name": "string|null",
      "organizer_photo": "string|null",
      "top_donors": []
    }
  ]
}
```

Callers:

- `HomeFeedViewModel`
- `AllCampaignsScreen`
- `SearchDiscoveryScreen`

### `GET publicca/one/{id}`

Input:

- route param `id`

Current DTO expects:

```json
{
  "success": true,
  "campain": {
    "...": "Campaign fields"
  }
}
```

Caller:

- `DetailsScreen`

### `GET organizor/readcampains/all`

Body:

- none

Auth:

- organizer JWT

Caller:

- `CampaignRepository.getOrganizerCampaigns()`

### `GET publicdo/all`

Current expected response:

```json
[
  {
    "_id": "string",
    "name": "string|null",
    "username": "string|null",
    "bio": "string|null",
    "photo": "string|null"
  }
]
```

Caller:

- `SearchViewModel.searchDonators()`

### `GET publicor/all`

Current expected response:

```json
[
  {
    "_id": "string",
    "name": "string|null",
    "username": "string|null",
    "bio": "string|null",
    "location": "string|null",
    "photo": "string|null",
    "is_verified": true
  }
]
```

Caller:

- `SearchViewModel.searchOrganizers()`

## Profile Routes

### `GET donator/getaccount`

Input:

- none (derived from JWT)

Expected response:

```json
{
  "success": true,
  "message": "string",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string|null",
    "profile_picture": "string|null",
    "role": "string",
    "preferences": ["string"],
    "createdAt": "string|null"
  }
}
```

Caller:

- `UserProfileViewModel`

### `POST donator/editaccount`

Transport:

- multipart

Expected parts:

- `name` optional
- `phone` optional
- `preferences` optional
- `photo` optional

Observed mismatch:

- screens create file parts named `"images"`
- Retrofit expects `photo`

## Donation Routes

### `GET donator/readdonaions/all`

Auth:

- donor JWT

Expected response:

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "_id": "string",
      "campaign_id": {
        "_id": "string",
        "title": "string"
      },
      "donator_id": "string",
      "amount": 0,
      "payment_methods": [
        {
          "type": "string",
          "details": "string"
        }
      ],
      "evidence_images": ["string"],
      "status": "approved|pending|rejected",
      "submitted_at": "string|null",
      "verified_at": "string|null"
    }
  ]
}
```

Callers:

- `DonationRepository`
- `ProfileRepository`

### `GET donator/readdonaions/all/{status}`

Input:

- route param `status`

Allowed values in comments:

- `approved`
- `pending`
- `rejected`

### `POST donation/createDonation`

Transport:

- multipart

Expected request parts from current code/comments:

- `campaign_id`
- `donator_id`
- `amount`
- `paiment_method` as stringified JSON array
- repeated evidence file parts

Payment array shape:

```json
[
  {
    "type": "string",
    "details": "string"
  }
]
```

Observed mismatch:

- API file parameter is named `evidance`
- repository call uses named argument `images`
- view model creates parts with form field `"images"`

## Organizer Dashboard Endpoint Gap

The current organizer dashboard UI expects a missing Retrofit method:

- `getOrganizerDashboard()`

Expected shape from the view model:

```json
{
  "totalImpactFunds": 0,
  "fundsGrowthPercent": 0,
  "monthlyFunds": [0, 0, 0, 0, 0, 0],
  "activeDonors": 0,
  "avgCampaignSuccess": 0,
  "campaigns": [],
  "recentDonations": []
}
```
