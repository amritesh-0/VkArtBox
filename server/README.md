# VkArtBox Admin

Admin dashboard for managing VkArtBox content, collections, applications, and contact submissions.

## Local Development

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

## Production Build

```bash
npm run build
```

## Vercel Deployment

Deploy this app as a separate Vercel project with these settings:

- Root Directory: `server`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

The included `vercel.json` handles SPA routing for `/login`, `/blogs`, `/collections`, `/applications`, `/contacts`, and `/settings`.

Add these environment variables in Vercel using your Firebase web app config:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

You can copy the variable names from `.env.example` for local setup.
