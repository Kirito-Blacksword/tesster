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

