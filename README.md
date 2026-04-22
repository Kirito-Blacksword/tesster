# Tesster — Mock Test Platform

A CBT-accurate mock test platform for JEE Main, BITSAT, COMEDK, and KCET aspirants. Built with Next.js 15, Prisma, and PostgreSQL.

## Features

- **Exam-accurate UI** — NTA-style test interface with subject navigation tabs, question palette, and auto-submit timer
- **4 exams supported** — JEE Main, BITSAT, COMEDK, KCET with correct marking schemes
- **Custom mock tests** — Admin can create, edit, draft, and publish custom tests
- **Deep result analysis** — Score, accuracy, time-per-question, subject breakdown, and insights
- **Google OAuth + email/password auth**
- **Premium access control** — Per-exam or all-access premium tiers
- **Admin panel** — Secure password-protected portal to manage exams and view registered users
- **Fullscreen exam mode** — Auto-fullscreen on test start with tab-switch warning

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Database** — PostgreSQL via [Neon](https://neon.tech)
- **ORM** — Prisma
- **Auth** — JWT (jose) + Google OAuth
- **Styling** — Tailwind CSS
- **Deployment** — Vercel

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Kirito-Blacksword/tesster.git
cd tesster
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_PASSWORD_HASH="bcrypt-hash-of-your-admin-password"
ADMIN_JWT_SECRET="your-admin-jwt-secret"
```

To generate an admin password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(h => console.log(h))"
```

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create an OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://your-domain.vercel.app/api/auth/google/callback` (prod)

## Admin Panel

Access at `/admin`. Default password: `Tesster@Admin2024!`

Change it by generating a new bcrypt hash and updating `ADMIN_PASSWORD_HASH` in your env.

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel → Settings → Environment Variables
4. Deploy

## Project Structure

```
app/                  # Next.js app router pages
  admin/              # Admin portal
  api/                # API routes
  exam/               # Exam shell page
  onboarding/         # Post-signup onboarding
components/           # React components
lib/                  # Utilities (auth, db, exams, etc.)
prisma/               # Database schema
public/               # Static assets (logo, uploads)
```
