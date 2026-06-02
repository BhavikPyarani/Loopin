# Loopin

Loopin is a community discussion app built with Next.js, Prisma, PostgreSQL, NextAuth credentials, and Firebase (for realtime chat features).

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma + PostgreSQL
- NextAuth v5 (Credentials provider)
- Firebase Auth + Realtime Database (chat integration)
- Tailwind CSS 4

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Firebase project (optional for non-chat auth flows, required for realtime chat)

## Environment Variables

Create `/.env.local` (or use `/.env`) with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# Recommended for NextAuth
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_URL=http://localhost:3000

# Firebase (required for realtime chat features)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Setup

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed sample data (optional):

```bash
npx prisma db seed
```

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth Behavior Notes

- Registration and login always work through credentials + database users.
- Firebase setup is treated as best-effort for registration.
- If Firebase is missing/misconfigured, account creation still succeeds; realtime chat features may not work until Firebase config is fixed.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```
