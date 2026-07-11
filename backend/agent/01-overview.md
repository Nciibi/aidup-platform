# Project Overview

## Purpose

AidUp is a backend API for a donation platform. The platform supports:

- donor registration and login
- organizer registration and login
- admin management
- campaign creation and moderation
- donation submission and review
- public browsing of campaigns, organizers, and donors
- MFA
- QR-based login from one device to another

The repository is an Express 5 application backed by MongoDB through Mongoose.

## High-Level Architecture

Runtime flow:

1. `server.js` loads environment variables and connects to MongoDB.
2. `server.js` creates an HTTP server from the Express app.
3. Socket.IO is attached for QR login events.
4. `app.js` configures middleware, mounts routes, and defines the error pipeline.

Main layers:

- `routes/`: Express route declarations
- `controllers/`: request handlers and business logic
- `models/`: Mongoose schemas
- `middleware/`: auth, authorization, upload, validation, auditing, rate limiting
- `services/`: email sending and QR session operations
- `utils/`: token helpers, verification helpers, validation helpers, logging helpers
- `public/`: read-only public routes
- `config/`: DB and CORS configuration
- `sockets/`: QR login Socket.IO setup

## Main Technical Stack

- Node.js CommonJS modules
- Express `^5.2.1`
- Mongoose `^9.3.0`
- JWT via `jsonwebtoken`
- bcrypt via `bcryptjs`
- Gmail email sending via `nodemailer`
- file upload via `multer`
- image optimization via `sharp`
- Socket.IO for QR auth
- Zod for validation
- pino for logging

## Main User Roles

- `ADMIN`
- `donator` or `DONATOR` depending on code path
- `organizer` or `ORGANIZER` depending on code path

The code frequently mixes uppercase and lowercase roles. This matters because some middleware uppercases roles before checking them, while some controllers persist lowercase roles.

## Current State of the Codebase

This is not a clean production backend. It is better described as a partially implemented application skeleton with working concepts and several hard failures.

What is solid enough to understand:

- overall route layout
- intended auth flow
- token issuance and refresh rotation concept
- email verification concept
- QR login concept
- data model direction

What is currently fragile or broken:

- some controllers export undefined functions
- some routes pass the wrong role casing to authorization middleware
- several handlers depend on route params that routes do not provide
- upload middleware only handles `req.file`, while many routes use `upload.fields`
- admin controller has missing imports and undefined identifiers
- some business rules use status values that do not match the schema enums
- audit logging is likely skipped for many JSON responses

## Naming Conventions In The Existing Code

The repository uses many inconsistent spellings. Another agent should not "correct mentally" without checking references:

- `campain` instead of `campaign`
- `organizor` instead of `organizer`
- `donator` instead of `donor`
- `paiment` instead of `payment`
- `evidance` instead of `evidence`

These typos appear in file names, route paths, model names, schema fields, and request body fields.

Any improvement work must handle backward compatibility explicitly if the API is already consumed elsewhere.
