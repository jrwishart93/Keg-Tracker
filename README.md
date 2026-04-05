# Keg Tracker

Initial implementation of the Keg Tracker app using Next.js App Router, TypeScript, Tailwind, and Firebase.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env vars:
   ```bash
   cp .env.example .env.local
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## Firebase setup

This app reads Firebase config from environment variables and connects to Cloud Firestore via `lib/firebase.ts`.

1. Copy sample env values:
   ```bash
   cp .env.example .env.local
   ```
2. Confirm the `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` match your Firebase project settings.
3. In Firebase Console, enable **Cloud Firestore** (Production or Test mode) for project `keg-tracker-635ce`.

## Demo auth flow (Firebase Auth + Firestore)

This prototype uses Firebase Authentication (email/password) and Firestore user profile documents (`users/{uid}`).

### Seed demo users

1. Ensure you can authenticate with Firebase Admin SDK locally.
   - Recommended: set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file with Auth + Firestore access.
   - Alternative: set `FIREBASE_SERVICE_ACCOUNT_PATH` to a JSON file path.
2. Run:
   ```bash
   npm run seed:demo-users
   ```

The script creates/updates these Firebase Auth users and matching Firestore `users` documents:

- `admin@beffect.local` / `Admin1234!` / role `admin` / `requiresPasswordChange: false`
- `ahughes@beffect.local` / `Password123!` / role `staff` / `requiresPasswordChange: true`
- `dev@beffect.local` / `Password123!` / role `developer` / `requiresPasswordChange: true`

### Test the login flow

1. Visit `/login` and sign in with one of the seeded users.
2. If `requiresPasswordChange` is true, you will be redirected to `/change-password` and must update the password before app access.
3. After password update, the app sets `requiresPasswordChange` to `false` in Firestore and redirects to `/dashboard`.
4. Use the header **Logout** button to sign out.

### Route behavior

- Unauthenticated users are redirected to `/login`.
- Authenticated users with `requiresPasswordChange: true` are forced to `/change-password` until completed.
- `/admin` is currently role-gated for `admin` users.

## Current scope

This build includes:
- Firebase initialization and Firestore helper layer.
- Auth context, login route, and middleware gatekeeping.
- Core route scaffolding for dashboard, scan, kegs, keg detail/action, locations, and admin.
- Reusable UI components for status badges, movement logs, action forms, cards, and mobile nav.
- Firestore security rules file.
