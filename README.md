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

## Current scope

This build includes:
- Firebase initialization and Firestore helper layer.
- Auth context, login route, and middleware gatekeeping.
- Core route scaffolding for dashboard, scan, kegs, keg detail/action, locations, and admin.
- Reusable UI components for status badges, movement logs, action forms, cards, and mobile nav.
- Firestore security rules file.
