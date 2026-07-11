# AidUp Project Documentation

This `skills` folder documents the current Android project as it exists in this repository.

## Files

- `architecture.md`: runtime architecture, package responsibilities, app bootstrap, storage, networking, and UI layering
- `project-structure.md`: source tree inventory and what each major file or folder is for
- `navigation-and-screens.md`: route map, screen responsibilities, route arguments, user actions, and which backend calls each screen triggers
- `api-contracts.md`: Retrofit endpoints, request payloads, response shapes, auth rules, and where each endpoint is used
- `data-models-and-state.md`: Kotlin models, UI state classes, repositories, and view model contracts
- `known-gaps-and-risks.md`: compile-time mismatches, incomplete flows, stale code, and contract drift already visible in the source

## Current Project Summary

AidUp is a single-module Android application built with Kotlin, Jetpack Compose, Navigation Compose, Retrofit, OkHttp, CameraX, ZXing, Credential Manager, and encrypted shared preferences.

It targets a backend running at:

- `http://10.0.2.2:5000/`

Primary functional areas:

- authentication for `Donator` and `Organizer`
- onboarding, login, registration, OTP verification
- public campaign browsing and detail viewing
- donation evidence upload flow scaffolding
- QR-based login approval from mobile to web
- donor profile and donation history
- organizer dashboard UI backed by an expected aggregate endpoint

## Important Note

The repository contains several contract and compile mismatches between screens, view models, repositories, and Retrofit declarations. Those are documented explicitly in `known-gaps-and-risks.md` rather than being hidden.
