# AidUp Dossier

## Repository Location
- Local clone path: `C:\Users\MSI\aidup`
- GitHub remote: `https://github.com/Nciibi/aidup.git`

## Summary
AidUp is a charity campaign platform that connects donators with organizers. It includes a web-based frontend and a backend API with authentication, MFA, file uploads, and campaign management.

## Key Components
- `backend/`
  - Node.js / Express API
  - MongoDB integration via Mongoose
  - Authentication and authorization
  - Multi-Factor Authentication (MFA) support
  - File upload handling and socket support
- `frontend/`
  - Vite-powered React application
  - Tailwind CSS and Material UI
  - Rich UI components with Radix and React Router

## Important Files
- `README.md` - high-level project overview and quick-start guide
- `backend/README.md` - backend API documentation and authentication details
- `backend/package.json` - backend dependencies and runtime details
- `frontend/package.json` - frontend dependencies and build scripts
- `full_guide.md` - additional repo-level documentation
- `step1_project_scan.md` / `step2_environment_check.md` - project setup or onboarding notes

## Current Notes
- The root `README.md` refers to directories as `AIDUPFRONTEND/` and `aidup-backend/`, but the actual local folder names are `frontend/` and `backend/`.
- The repo is already present locally, so no clone action was necessary.

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Frontend: React, Vite, Tailwind CSS, MUI, Radix UI, React Router

## Setup Instructions
### Backend
```powershell
cd C:\Users\MSI\aidup\backend
npm install
# create .env file with DB and JWT settings
npm run dev
```

### Frontend
```powershell
cd C:\Users\MSI\aidup\frontend
npm install
npm run dev
```

## Recommended Next Steps
1. Review `backend/README.md` for API endpoint details.
2. Confirm environment variables for backend and any database connection settings.
3. Start backend and frontend in separate terminals for local development.
