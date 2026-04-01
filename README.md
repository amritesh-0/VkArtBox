# VkArtBox

VkArtBox is a two-application frontend workspace for an art brand:

- Public website at the repository root, built with React and Create React App
- Admin dashboard in [`server/`](/Users/amriteshpandey/Downloads/vkartbox/server), built with React and Vite

Both apps use Firebase for authentication, Firestore, and Storage. Both are intended to be deployed as separate static applications.

## Architecture

This repository does not contain a traditional backend service.

- `./` serves the public site
- `./server` serves the admin panel
- Firebase provides the managed backend services:
  - Authentication for admin login
  - Firestore for blogs, collections, contact messages, and career applications
  - Storage for uploaded images and resumes

Primary Firestore collections currently used by the apps:

- `blogs`
- `collections`
- `artworks`
- `careerApplications`
- `contactMessages`

## Repository Layout

```text
vkartbox/
├── public/                  # Public site static assets
├── scripts/                 # Firestore seeding utilities
├── src/                     # Public site source
├── server/                  # Admin SPA (Vite)
│   ├── src/
│   └── vercel.json
├── package.json             # Public site scripts
├── vercel.json              # Public site Vercel config
└── README.md
```

## Tech Stack

- React 18
- React Router 7
- Firebase Web SDK
- Create React App for the public site
- Vite for the admin dashboard
- Vercel for static hosting

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A Firebase project with:
  - Firestore enabled
  - Storage enabled
  - Email/Password authentication enabled for admin access

## Environment Variables

The two apps use different env prefixes because they are built with different toolchains.

### Root app: `.env`

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

FIREBASE_ADMIN_EMAIL=
FIREBASE_ADMIN_PASSWORD=
```

Notes:

- `REACT_APP_*` variables are used by the public site
- `FIREBASE_ADMIN_EMAIL` and `FIREBASE_ADMIN_PASSWORD` are only used by the seed script when authenticated writes are required by Firebase rules

### Admin app: `server/.env`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Notes:

- `VITE_*` variables are required by the admin dashboard
- The admin app will warn at runtime if required Firebase variables are missing

## Local Development

Install dependencies for both applications:

```bash
npm install
cd server && npm install
```

Run the public site:

```bash
npm start
```

Default URL: `http://localhost:3000`

Run the admin dashboard:

```bash
cd server
npm run dev
```

Default URL: `http://localhost:5173`

## Build Commands

Public site:

```bash
npm run build
```

Outputs to `build/`

Admin dashboard:

```bash
cd server
npm run build
```

Outputs to `server/dist/`

## Deployment

Deploy the public site and admin dashboard as two separate Vercel projects.

### 1. Public site

- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `build`
- Vercel config: [`vercel.json`](/Users/amriteshpandey/Downloads/vkartbox/vercel.json)

### 2. Admin dashboard

- Root directory: `server`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Vercel config: [`server/vercel.json`](/Users/amriteshpandey/Downloads/vkartbox/server/vercel.json)

Both Vercel configs include SPA fallback routing so deep links resolve to `index.html`.

## Firebase Requirements

To run this system in production, configure Firebase with at least the following:

- Authentication
  - Enable Email/Password sign-in
  - Create admin users manually in Firebase Auth
- Firestore
  - Create and validate rules for public reads and restricted admin writes
- Storage
  - Allow admin uploads for blog images, artwork images, and candidate resumes

Recommended production setup:

- Use separate Firebase projects for development and production
- Restrict Firestore and Storage writes to authenticated admin users
- Review CORS, domain allowlists, and authorized domains in Firebase Authentication
- Keep Vercel env vars separate per environment

## Data Seeding

Seed content into Firestore from the repository data files:

```bash
npm run seed:firestore
```

Optional reset mode:

```bash
npm run seed:firestore -- --reset
```

Seed source files:

- [`scripts/seed-data/collectionData.js`](/Users/amriteshpandey/Downloads/vkartbox/scripts/seed-data/collectionData.js)
- [`scripts/seed-data/blogData.js`](/Users/amriteshpandey/Downloads/vkartbox/scripts/seed-data/blogData.js)

Operational note:

- The current seeding script uses embedded Firebase web config and optional env-based admin credentials
- If this repository is reused across multiple environments, move all Firebase config used by the seed script into environment variables before treating it as a production automation path

## Admin Access

The admin dashboard uses Firebase Authentication and expects a valid email/password account.

- Login page: `/login`
- Protected routes are enforced client-side and backed by Firebase auth state
- Admin users should be created and managed in Firebase Authentication, not hardcoded in the application

## Production Checklist

- Create separate Vercel projects for root and `server`
- Set all required environment variables in both projects
- Use separate Firebase projects or at minimum separate env sets for dev and prod
- Confirm Firebase Authentication authorized domains include deployed Vercel domains
- Review Firestore and Storage security rules before launch
- Validate SPA routing on refresh for both deployed apps
- Test create, edit, delete, upload, contact, and career application flows against production configuration
- Ensure secrets are not committed to the repository

## Available Scripts

Root application:

- `npm start`
- `npm run build`
- `npm test`
- `npm run seed:firestore`

Admin application:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Security Notes

- Do not commit `.env` files
- Do not store admin passwords in source control
- Treat Firebase config, admin credentials, and deployment env vars as environment-managed configuration
- Rotate any credentials that were previously committed

## License

Private repository. All rights reserved.
