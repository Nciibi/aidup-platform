# AidUp Backend Agent Docs

This folder documents the current repository at `C:\Users\ncibi\Desktop\aidup-backend` for use by another coding agent.

Read in this order:

1. `01-overview.md`
2. `02-runtime-and-config.md`
3. `03-data-models.md`
4. `04-api-and-routes.md`
5. `05-auth-and-security.md`
6. `06-file-map.md`
7. `07-known-issues-and-improvement-opportunities.md`

Important context:

- This is a Node.js + Express + MongoDB backend for AidUp.
- The codebase mixes template-quality code with incomplete or broken application-specific code.
- Route naming, file naming, and field naming are inconsistent. Typos such as `campain`, `organizor`, `donator`, `paiment`, and `evidance` are part of the current code and API.
- Several modules describe intended behavior but do not fully implement it. The defect register is not optional reading.
- There are no tests in the repository.

Primary entry points:

- `server.js`
- `app.js`

Primary domain areas:

- authentication and session management
- email verification and password reset
- multi-factor authentication
- QR login via Socket.IO
- campaigns
- donations
- organizer, donor, and admin management
- public read-only endpoints
