# Data Models

This section documents the current MongoDB schemas exactly as defined, including inconsistencies.

## `models/admin.js`

Model name: `admin`

Fields:

- `username`
- `email`
- `password`
- `loginAttempts`
- `lockUntil`
- `refreshTokens`
- `role`, default `ADMIN`
- `lastLogin`
- `lastIp`
- `deviceInfo`

`toJSON` removes `password`.

## `models/donator.js`

Model name: `donator`

Fields:

- `name`
- `username`
- `bio`
- `email`
- `password`
- `phoneNumber`
- `isVerified`
- `photo`
- `resetPasswordToken`
- `resetPasswordExpires`
- `loginAttempts`
- `lockUntil`
- `refreshTokens`
- `mfaSecret`
- `isMfaEnabled`
- `role`, default `donator`
- `lastLogin`
- `lastIp`
- `deviceInfo`
- `isGoogleAuth`

Notes:

- `isVerified` is declared twice in the schema
- `toJSON` does not strip sensitive fields

## `models/organizer.js`

Model name: `organizer`

Fields:

- `name`
- `username`
- `bio`
- `location`
- `website`
- `phone_number`
- `photo`
- `email`
- `password`
- `old_password`
- `phoneNumber`
- `resetPasswordToken`
- `resetPasswordExpires`
- `loginAttempts`
- `lockUntil`
- `refreshTokens`
- `mfaSecret`
- `isMfaEnabled`
- `role`, default `organizer`
- `lastLogin`
- `lastIp`
- `deviceInfo`
- `verification`
- `is_verified`
- `isVerified`
- `isGoogleAuth`

Notes:

- both `is_verified` and `isVerified` exist
- both `phone_number` and `phoneNumber` exist

## `models/campaign.js`

Model name: `campaign`

Fields:

- `organizer_id`
- `title`
- `description`
- `goal_amount`
- `raised_amount`
- `images`
- `videos`
- `paiment_methods`
- `status`: `pending | approved | rejected`
- `created_at`
- `approved_at`
- `rejected_at`
- `category`

## `models/campaindonation.js`

Model name: `campaindonation`

Fields:

- `campaign_id`
- `donated_amount`
- `donations`

## `models/donation.js`

Model name: `donation`

Fields:

- `donator_id`
- `campaign_id`
- `amount`
- `currency`
- `status`: `pending | approved | rejected`
- `reviewed_by_admin`
- `review_comments`
- `review_date`
- `submitted_date`
- `evidance`
- `paiment_method`
- `description`

Notes:

- `review_comments` is required even for newly created donations

## `models/orgverification.js`

Model name: `orgverification`

Fields:

- `organizer_id`
- `documents_type`
- `documents_url`
- `status`: `pending | approved | rejected`
- `reviewed_by_admin`
- `review_comments`
- `review_date`
- `submitted_date`

Notes:

- `review_comments` is also required here, which is awkward for pending requests

## `models/paimentmethods.js`

Model name: `paimentmethod`

Fields:

- `method_type`

## `models/AuditLog.js`

Model name: `auditlog`

Fields:

- `userId`
- `userModel`
- `action`
- `resource`
- `details`
- `ip`
- `userAgent`
- `status`
- `timestamp`

## `models/QrSession.js`

Model name: `QrSession`

Fields:

- `sessionId`
- `status`: `pending | authenticated | used | expired`
- `userId`
- `userModel`
- `socketId`
- `createdAt`

Virtual:

- `expiresAt = createdAt + 2 minutes`

TTL cleanup:

- document expires after 120 seconds

## `models/VerificationCode.js`

Model name: `VerificationCode`

Fields:

- `email`
- `code`
- `createdAt`

TTL cleanup:

- document expires after 10 minutes
