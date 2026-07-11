# Contributing to AidUp 🫶

We're thrilled you're interested in contributing to AidUp! Whether you're fixing a bug, adding a feature, improving documentation, or just asking a question — every contribution is welcome.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Project Overview](#project-overview)
4. [Development Workflow](#development-workflow)
5. [Coding Conventions](#coding-conventions)
6. [Pull Request Guidelines](#pull-request-guidelines)
7. [Need Help?](#need-help)

---

## Code of Conduct

By participating in this project, you agree to maintain a **respectful, inclusive, and harassment-free** environment for everyone. Be kind, assume good intent, and focus on what's best for the community.

---

## Getting Started

1. **Fork** the repository.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/aidup-platform.git
   cd aidup-platform
   ```
3. **Pick an area** to contribute to:

   | Area | Start Here |
   |---|---|
   | **Backend API** | [`backend/`](./backend) — Express + MongoDB + Socket.IO |
   | **Web Frontend** | [`frontend/`](./frontend) — React + Vite + Tailwind |
   | **Android App** | [`mobile/`](./mobile) — Kotlin + Jetpack Compose |
   | **Marketing Site** | [`frontend/modern-homepage/`](./frontend/modern-homepage) — Next.js |
   | **Documentation** | [`README.md`](./README.md), [`backend/README.md`](./backend/README.md) |

4. **Look for open issues** tagged `good first issue` or `help wanted`.
5. **Set up your environment** following the [README Quick Start](./README.md#-quick-start).

---

## Project Overview

AidUp is a **monorepo** with three first-class clients sharing a single API:

```
aidup-platform/
├── backend/    # Express REST API + Socket.IO
├── frontend/   # React SPA + Next.js marketing site
└── mobile/     # Native Android app
```

The backend guide for detailed patterns: [`frontend/CONTRIBUTING_BACKEND.md`](./frontend/CONTRIBUTING_BACKEND.md).

---

## Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feat/your-feature-name

# 2. Make your changes
#    - Write clean, well-structured code
#    - Match the existing style of the area you're working in

# 3. Run quality checks
#    Frontend:
cd frontend && npm run lint && npm run build

#    Backend:
cd backend && npm start     # smoke test the API

# 4. Commit using conventional commits
git commit -m "feat: add campaign search by location"
#    Types: feat, fix, docs, refactor, test, chore, style

# 5. Push and open a Pull Request
git push origin feat/your-feature-name
```

---

## Coding Conventions

### Backend (Node.js / Express)

- **Validation first** — use `zod` schemas in controllers before any logic
- **MVC pattern** — route → controller → service → model
- **Error handling** — throw errors with descriptive messages; the centralized error handler will format the response
- **Middleware** — authentication (`verifyJWT`), authorization (`authorize(role)`), and uploads in `middleware/`
- **Naming** — camelCase for variables/functions, PascalCase for models/classes
- Detailed guide: [`frontend/CONTRIBUTING_BACKEND.md`](./frontend/CONTRIBUTING_BACKEND.md)

### Frontend (React / TypeScript)

- **Feature-based organization** — place page components in `pages/`, shared UI in `components/`
- **State management** — use Zustand stores for global state, React hooks for local state
- **API calls** — use the pre-configured Axios clients in `api/`
- **Styling** — Tailwind CSS 4 utility classes; avoid custom CSS unless necessary
- **TypeScript** — strict mode enabled; avoid `any` wherever possible
- **Imports** — prefer named exports; use barrel exports from `index.ts` files

### Mobile (Kotlin / Jetpack Compose)

- **Layered architecture** — `ViewModel` → `Repository` → `Network` (Retrofit)
- **UI** — Compose with Material 3; prefer `@Composable` functions over custom views
- **State** — `StateFlow` in ViewModels, `collectAsState()` in Composables
- **Navigation** — Compose Navigation with route strings defined in `navigation/`
- **Naming** — camelCase for functions/variables, PascalCase for classes

---

## Pull Request Guidelines

- **One PR per feature or fix** — keep changes focused
- **Write a clear title** using conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Describe your changes** in the PR body — what, why, and how to test
- **Keep it small** — PRs under 300 lines are easier to review
- **Link related issues** — use `Closes #123` to auto-close issues
- **Ensure CI passes** — the pipeline runs linting, type-checking, and build

### PR Review Checklist

- [ ] Code follows the project's conventions
- [ ] No new warnings or errors
- [ ] Changes are tested (manual or automated)
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

---

## Need Help?

- **Open a Discussion** — for questions, ideas, or general help
- **File an Issue** — for bug reports or feature requests
- **Tag a maintainer** — if you're stuck on a specific problem

---

<p align="center">
  <i>Every contribution matters. Thank you for being part of AidUp. 🙌</i>
</p>
