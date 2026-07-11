# 🔧 STEP 2 — Environment Verification Report

## Environment Status Checklist

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 1 | Node.js installed | 🔴 **NOT INSTALLED** | Must install Node.js first |
| 2 | npm installed | 🔴 **NOT INSTALLED** | Comes with Node.js |
| 3 | `backend/.env` | ✅ Found | None (but see security warning below) |
| 4 | `backend/.env.example` | ❌ Missing | Not critical — `.env` already exists |
| 5 | `frontend/.env` | ⚠️ Missing | Optional — has hardcoded fallback |
| 6 | `frontend/.env.example` | ❌ Missing | Not critical |
| 7 | `backend/node_modules` | 🔴 **Missing** | Run `npm install` after installing Node |
| 8 | `frontend/node_modules` | 🔴 **Missing** | Run `npm install` after installing Node |

---

## 🚨 BLOCKER: Node.js Is Not Installed

This is the **#1 thing to fix** before anything else can happen.

When I ran `node --version` and `npm --version`, the system responded (in French):

> *"Le terme 'node' n'est pas reconnu..."*  
> (English: "The term 'node' is not recognized...")

I also searched common installation paths (`C:\Program Files\nodejs`, nvm, fnm) — **Node.js is not installed anywhere on this machine.**

### What You Need To Do

#### Option A: Download from the Official Website (Recommended for Beginners)

1. Go to **https://nodejs.org**
2. Download the **LTS version** (Long-Term Support) — it should say something like **"Node.js v22.x LTS"** or similar
3. Run the installer — accept all defaults, make sure **"Add to PATH"** is checked ✅
4. **Restart your terminal/PowerShell** after installation
5. Verify it worked:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers like `v22.x.x` and `10.x.x`

#### Option B: Install via winget (if you prefer command line)

```powershell
winget install OpenJS.NodeJS.LTS
```
Then restart your terminal.

> [!IMPORTANT]
> **Why LTS?** This project uses Express 5, Mongoose 9, and lockfileVersion 3 — all of which require Node.js 18 or higher. The LTS (Long-Term Support) version is always the safest choice because it gets security updates for years and is the most stable.

---

## 📁 `.env` File Details

### ✅ `backend/.env` — Found

The backend `.env` file exists and contains these variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `5000` | Which port the server listens on |
| `NODE_ENV` | `development` | Tells the app to run in dev mode |
| `MONGO_URI` | `mongodb+srv://...` | Connection string to MongoDB Atlas |
| `JWT_SECRET` | `your_super_secret...` | Secret key for signing login tokens |
| `REFRESH_TOKEN_SECRET` | `your_even_more...` | Secret key for refresh tokens |
| `GOOGLE_CLIENT_ID` | `39328...` | Google OAuth integration |
| `FRONTEND_URL` | `http://localhost:5000` | Where the frontend lives |
| `EMAIL_USER` | `ncibi...@gmail.com` | Gmail account for sending emails |
| `EMAIL_PASS` | `lcdzehr...` | Gmail app password |

> [!CAUTION]
> **Security Alert!** The `.env` file contains real credentials (MongoDB password, Gmail password, Google OAuth ID). These should **NEVER** be committed to Git. Check that `backend/.gitignore` includes `.env` — I saw it contains only 12 bytes, so it might not cover everything. We'll use this `.env` for our tests but be careful not to push it.

### ❌ `frontend/.env` — Missing (OK for now)

The frontend uses this line in `src/api/axios.ts`:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

The `|| "http://localhost:5000"` part is a **fallback** — it means: "If no env variable is set, just use localhost:5000." So the frontend will work without a `.env` file during local development.

If you ever need to point it at a different backend URL, create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 📦 `node_modules` — Missing in Both Folders

`node_modules` is the folder where npm stores all the third-party code your project depends on. **Both folders are missing it**, which means the project can't run yet.

### Commands to fix (run AFTER installing Node.js):

```powershell
# Step 1: Install backend dependencies
cd c:\Users\USER\Desktop\projet\aidup\backend
npm install

# Step 2: Install frontend dependencies  
cd c:\Users\USER\Desktop\projet\aidup\frontend
npm install
```

> [!NOTE]
> The `package-lock.json` files exist in both folders — that's great! It means `npm install` will install the **exact same versions** that the original developer used, avoiding unexpected surprises.

---

## 📋 Dependency Analysis

### Backend `package.json`

| Status | Details |
|--------|---------|
| ⚠️ No `"name"` field | Not critical but unusual — npm may show a warning |
| ⚠️ No `"scripts"` section | There's no `"start"` or `"test"` script defined — we'll need to add test scripts |
| ⚠️ No `devDependencies` | Everything is in `dependencies` — no testing tools at all |
| ✅ All deps look compatible | Express 5, Mongoose 9, modern package versions |

### Frontend `package.json`

| Status | Details |
|--------|---------|
| ✅ Has `"scripts"` | `"dev": "vite"` and `"build": "vite build"` |
| ⚠️ No `"test"` script | We'll add one later |
| ⚠️ `react` is in `peerDependencies` | React 18.3.1 is listed as an optional peer dep, not a direct dep — `npm install` should handle this, but we may need to install it explicitly |
| ✅ Has `devDependencies` | Vite, Tailwind, React plugin — all good |

---

## 🎓 Mentor Note: What Are `.env` Files, `node_modules`, and Why Do They Matter?

### What is a `.env` file?

A `.env` file is like a **secret notebook** that your application reads when it starts up. It contains **configuration values** that change between environments (your laptop vs. a live server) or that are **sensitive** (passwords, API keys).

**Why it matters for security:**
- If you accidentally upload your `.env` to GitHub, anyone can see your database password, email credentials, etc.
- That's why `.env` is always listed in `.gitignore` — a file that tells Git "never track these files"
- Instead, teams share a `.env.example` file that shows what variables are needed but with **fake placeholder values**

**Example of safe vs. unsafe:**
```env
# .env (REAL - never share!)
MONGO_URI=mongodb+srv://realuser:realpassword@cluster.mongodb.net

# .env.example (SAFE - share this!)
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net
```

### What is `node_modules`?

When developers write a JavaScript application, they don't write everything from scratch. They use **packages** (pre-built code written by others) — things like Express, React, Mongoose, etc.

`node_modules` is the folder where all these packages live on your computer. When you run `npm install`, npm reads the `package.json` file (which lists what your project needs) and downloads all those packages into `node_modules`.

**What could go wrong if it's missing?**
- **Nothing will work.** When your code says `require('express')`, Node.js looks in `node_modules` for Express. If the folder doesn't exist, you'll get: `Error: Cannot find module 'express'`
- It's like trying to bake a cake with no ingredients — the recipe (`package.json`) exists, but the actual flour and sugar (`node_modules`) aren't in your kitchen yet

**Why isn't `node_modules` in Git?**
- It can be **massive** (hundreds of megabytes)
- It can be perfectly recreated from `package.json` + `package-lock.json` by running `npm install`
- That's why it's in `.gitignore` — Git ignores it, and each developer runs `npm install` on their own machine

---

## ✅ Action Summary — What To Do Now

Here is your to-do list in order:

```
1. 🔴 Install Node.js LTS from https://nodejs.org
2. 🔄 Restart your terminal/PowerShell
3. ✅ Verify:  node --version  →  should show v18+ or v20+ or v22+
4. ✅ Verify:  npm --version   →  should show 9+ or 10+
5. 📦 Run:    cd c:\Users\USER\Desktop\projet\aidup\backend && npm install
6. 📦 Run:    cd c:\Users\USER\Desktop\projet\aidup\frontend && npm install
7. 💬 Tell me "Done!" and I'll proceed to Step 3
```

> [!WARNING]
> **Do NOT skip to Step 3 without installing Node.js.** We cannot install testing libraries, write test scripts, or run any tests without Node.js and npm. This is a hard blocker.

---

✅ **Step 2 is complete!** Install Node.js, run the two `npm install` commands, then confirm and I'll move to **Step 3 — Generate the Test Map**.
