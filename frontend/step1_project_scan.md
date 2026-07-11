# 🔍 STEP 1 — Project Scan Results

## Quick Summary

```
Backend:  Node.js + Express 5  |  Database: MongoDB (Mongoose)
Frontend: React 18 + Vite + TailwindCSS 4  |  UI Lib: Radix UI + MUI
Package Manager: npm (for both)
Testing Libraries: ❌ NONE installed — we'll set these up from scratch!
```

---

## What Is This Project?

**AidUp** is a **donation platform** — think of it like a simplified GoFundMe.  
It has three kinds of users:

| Role | What they do |
|------|-------------|
| **Donator** (donor) | Browse campaigns and make donations |
| **Organizer** (recipient) | Create and manage fundraising campaigns |
| **Admin** | Moderate everything — approve/reject campaigns, manage users |

---

## Backend Breakdown

| Item | Details |
|------|---------|
| **Language** | JavaScript (Node.js, CommonJS modules — uses `require()`) |
| **Framework** | Express `v5.2.1` |
| **Database** | MongoDB via Mongoose `v9.3.0` |
| **Auth** | JWT tokens (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`) |
| **Main Entry** | `backend/app.js` (creates the Express app) — server startup is in a `server.js` file that also connects to MongoDB and sets up Socket.IO |
| **Other key deps** | `multer` (file uploads), `sharp` (image processing), `nodemailer` (emails), `zod` (data validation), `socket.io` (real-time QR login), `pino` (logging) |

### Backend Directory Structure

```
backend/
├── app.js              ← Main Express app (middleware + route mounting)
├── config/             ← Database & CORS settings
├── controllers/        ← Business logic (9 controller files)
├── middleware/         ← Auth, uploads, validation, rate limiting (9 files)
├── models/            ← Mongoose data models (12 schemas)
├── routes/            ← API route definitions (9 route files)
├── public/            ← Public (no-login-needed) routes (3 files)
├── services/          ← Email & QR session services
├── sockets/           ← Socket.IO for QR code login
├── utils/             ← Helpers (tokens, validation schemas, logging)
├── scripts/           ← Utility scripts (1 file: clear_test_user.js)
├── uploads/           ← Uploaded images storage
├── logs/              ← Application log files
├── .env               ← Environment variables (⚠️ contains secrets!)
└── package.json       ← Dependencies list (NO test scripts or test deps)
```

---

## Frontend Breakdown

| Item | Details |
|------|---------|
| **Language** | TypeScript (`.tsx` files) |
| **Framework** | React `18.3.1` |
| **Build Tool** | Vite `6.3.5` |
| **CSS** | TailwindCSS `v4.1.12` |
| **UI Libraries** | Radix UI (many primitives), MUI (Material UI), Lucide icons |
| **State Management** | Zustand `v5.0.12` |
| **HTTP Client** | Axios |
| **Routing** | React Router `v7.13.0` |
| **Main Entry** | `frontend/src/main.tsx` → `frontend/src/app/App.tsx` → `frontend/src/app/routes.tsx` |

### Frontend Directory Structure

```
frontend/
├── index.html          ← HTML shell (Vite entry)
├── vite.config.ts      ← Vite + React + Tailwind config
├── package.json        ← Dependencies (NO test scripts or test deps)
├── src/
│   ├── main.tsx        ← React root render
│   ├── app/
│   │   ├── App.tsx     ← Root component (Router + Toaster)
│   │   ├── routes.tsx  ← All page routes defined here
│   │   ├── pages/      ← 16 page components (.tsx)
│   │   └── components/ ← Shared/UI components
│   ├── api/            ← Axios instance + API call functions (6 files)
│   ├── store/          ← Zustand auth store
│   └── styles/         ← CSS files
└── guidelines/         ← Design guidelines
```

### Frontend Pages (16 total)

| File | Purpose |
|------|---------|
| `Home.tsx` | Landing page |
| `Login.tsx` | Login form (parameterized by user type) |
| `SignUp.tsx` | Registration form |
| `ForgotPassword.tsx` | Request password reset |
| `ResetPassword.tsx` | Set new password |
| `QRLogin.tsx` | QR code–based login |
| `CampaignList.tsx` | Browse all campaigns |
| `CampaignDetail.tsx` | View single campaign |
| `DonorDashboard.tsx` | Donor's main dashboard |
| `DonationHistory.tsx` | Donor's donation history |
| `DonorProfile.tsx` | Donor's profile settings |
| `RecipientDashboard.tsx` | Organizer's dashboard |
| `OrganizerCampaigns.tsx` | Organizer's campaigns list |
| `CreateCampaign.tsx` | Create a new campaign |
| `AdminPanel.tsx` | Admin management panel |
| `Unauthorized.tsx` | "Access denied" page |

---

## Testing Status

> **There are ZERO testing libraries installed and ZERO test files in the entire project.**

- No `jest`, `mocha`, `vitest`, `playwright`, `cypress`, or `supertest` in either `package.json`
- No `test` script in either `package.json`
- No `*.test.js`, `*.spec.js`, `*.test.ts`, or `*.spec.ts` files found anywhere
- The only testing-related file is `backend/scripts/clear_test_user.js` (a cleanup utility, not a test)

**This means we're building the test infrastructure completely from scratch!** 🏗️

---

## 🎓 Mentor Note: What Is a "Tech Stack"?

Think of a **tech stack** like a recipe's list of ingredients. Before you cook (test) a dish (an app), you need to know what ingredients (technologies) were used to make it.

A **tech stack** is simply the combination of programming languages, frameworks, databases, and tools that were used to build an application. For AidUp, the stack is:

```
React (frontend UI) + Express (backend API) + MongoDB (database) + Vite (build tool)
```

### Why does identifying the tech stack matter before writing tests?

1. **Different tools need different testing libraries.** You can't use a React testing library on an Express API! Knowing the stack tells you *which* testing tools to install.

2. **It tells you what to test.** A React frontend needs UI tests (clicking buttons, filling forms). An Express API needs request/response tests (sending HTTP requests and checking answers).

3. **It reveals how things connect.** The frontend sends requests to `http://localhost:5000` via Axios → the backend handles them in Express → data is stored in MongoDB. Understanding this chain helps you write tests that cover real user flows.

4. **It prevents wasted time.** If you started writing Python tests for a JavaScript project, nothing would work! Knowing the stack upfront saves hours of confusion.

> **Think of it this way:** A doctor checks your vitals before prescribing medicine. A tester scans the tech stack before writing tests. Same principle — *understand first, act second.*

---

## ⚠️ Notable Observations

The project documentation itself notes several issues:

- **Inconsistent naming**: `campain` (should be `campaign`), `organizor` (should be `organizer`), `evidance` (should be `evidence`)
- **Role casing inconsistencies**: Some places use `DONATOR`, others `donator`
- **Some controllers export undefined functions** — this could cause runtime errors
- **The codebase is described as "a partially implemented application skeleton"** — not production-ready

These observations will be important when we write tests — we'll need to test what *actually works* and identify what's broken!

---

✅ **Step 1 is complete!** Confirm you've read this and I'll move to **Step 2 — Verify the Environment**.
