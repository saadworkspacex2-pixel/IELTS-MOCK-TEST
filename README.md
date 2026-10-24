<div align="center">

# LHBD · IELTS Mock Test

### A Bengali-first online IELTS preparation and mock-exam platform

[![Quality checks](https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST/actions/workflows/quality.yml/badge.svg)](https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST/actions/workflows/quality.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Practice with confidence. Track progress. Improve for IELTS.**

[Features](#features) · [Quick start](#quick-start) · [Configuration](#configuration) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

</div>

---

## Overview

**LHBD · IELTS Mock Test** is a responsive, Bengali-first practice platform for IELTS learners. It brings realistic timed tests, instant scoring where applicable, detailed results, learning resources, and an operational admin workspace into one application.

The project is built with the Next.js App Router, TypeScript, PostgreSQL, and Drizzle ORM. It is designed for both learners and platform administrators, with clear premium-access controls and Bangladesh-friendly manual payment requests.

> The interface and learner guidance are primarily in Bangla so students can focus on IELTS skills—not on navigating the product.

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎯 Learner experience</h3>
      <ul>
        <li>Timed MCQ, Reading, Listening, Writing, and gap-fill practice flows</li>
        <li>Question navigation, progress tracking, review states, and autosaved sessions</li>
        <li>Direct-click fullscreen exam entry with a graceful fallback when fullscreen is unavailable</li>
        <li>Instant scores for auto-gradable attempts and instructor evaluation support for writing</li>
        <li>Personal profile, result history, printable reports, and leaderboard</li>
        <li>Bengali first-visit guides that appear in the relevant workflow—not on the home page</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🛠️ Admin workspace</h3>
      <ul>
        <li>Create and manage exams, sections, question types, resources, media, and results</li>
        <li>Label exams and resources as <strong>Free</strong> or <strong>Premium</strong></li>
        <li>Manage staff roles, learners, grading, site content, theme, branding, analytics, and leaderboard visibility</li>
        <li>Contextual Bengali tours for the admin and question-management workflows</li>
        <li>Per-page SEO manager for title, description, keywords, hashtags, canonical metadata, and search preview</li>
        <li>Configurable Premium tiers, benefits, duration, price, payment instructions, and manual membership activation</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💳 Premium & payments</h3>
      <ul>
        <li>Three configurable tiers: Starter, Plus, and Pro</li>
        <li>bKash, Nagad, Rocket, and Upay send-money request flow</li>
        <li>Transaction ID submission, admin approval/rejection inbox, and manual Premium activation</li>
        <li>Downloadable approved-payment receipt PDF with buying code and verification token</li>
        <li>No real wallet number or commercial price is hard-coded</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>✉️ Accounts & communication</h3>
      <ul>
        <li>Registration, login, session, and password-reset flows</li>
        <li>Secure email OTP password recovery with expiry and retry protection</li>
        <li>Optional Gmail SMTP lifecycle emails for welcome, login, results, and recovery events</li>
        <li>SEO metadata, sitemap, robots rules, privacy, terms, and consent surfaces</li>
      </ul>
    </td>
  </tr>
</table>

## Technology

| Layer | Tools |
| --- | --- |
| Front end | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Motion & type | React Spring, Hind Siliguri, Manrope |
| Database | PostgreSQL, Drizzle ORM, `pg` |
| Email | Nodemailer with Gmail SMTP (optional runtime integration) |
| Quality | TypeScript strict checking, ESLint, GitHub Actions |

## Quick start

### 1. Prerequisites

- **Node.js 20.9+** and npm 10+
- A running **PostgreSQL** instance
- `psql` command-line client only if you want to load the optional sample-data seed

### 2. Clone and install

```bash
git clone https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST.git
cd IELTS-MOCK-TEST
npm ci
```

> If you are intentionally developing without the committed lockfile, use `npm install` instead.

### 3. Create local environment settings

```bash
cp .env.example .env.local
```

Edit `.env.local` and at minimum set `DATABASE_URL` and a strong `ADMIN_PASSWORD`.

### 4. Create the database and load the starter data

```bash
# Example only — choose your own database name and credentials.
createdb ielts_mock_test

export DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/ielts_mock_test'
npm run db:migrate
# Optional: load sample practice data into a local database only.
psql "$DATABASE_URL" -f scripts/seed.sql
```

The seed file provides sample practice content. Do not run it against a production database unless you intentionally want the sample data.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin sign-in is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Configuration

Copy `.env.example` to `.env.local`. Never commit a real `.env*` file.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by the application |
| `ADMIN_PASSWORD` | Yes in production | Super-admin password; use a long, unique value |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public URL used in metadata and email links |
| `EMAIL_USER` | Optional | Gmail account used by Nodemailer SMTP |
| `EMAIL_PASS` | Optional | Google App Password for `EMAIL_USER` — never use a normal Gmail password |
| `EMAIL_FROM` | Optional | Gmail account or approved alias display address, e.g. `LHBD <your-gmail@gmail.com>` |

### Transactional email

When `EMAIL_USER` and `EMAIL_PASS` are available, the platform sends branded messages through Gmail SMTP using Nodemailer. Create a Google App Password after enabling 2-Step Verification; do not use the Gmail account's normal password. Email failures are intentionally non-blocking so an unavailable provider does not prevent a learner from using the application.

The protected admin-only endpoint `POST /api/admin/send-email` accepts `to`, `subject`, and `html` or `text` for operational messages. It is intentionally not public, so the application cannot become an open email relay.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Produce an optimized production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Run TypeScript strict checks without emitting files |
| `npm run lint` | Run ESLint across the codebase |
| `npm run db:migrate` | Apply the idempotent `scripts/schema.sql` migration using `DATABASE_URL` |
| `npm run db:seed` | Load sample data using `DATABASE_URL` (requires `psql`) |

## Project structure

```text
src/
├── app/                 # Pages, route handlers, metadata, and API endpoints
│   ├── admin/           # Admin sign-in and management workspace
│   ├── api/             # Authentication, exams, payments, results, settings, etc.
│   ├── exams/           # Catalogue, exam start, and test-taking experience
│   └── premium/         # Membership tiers and payment-request experience
├── components/          # Reusable UI, payment flow, tours, gates, and navigation
├── db/                  # PostgreSQL connection and Drizzle schema
└── lib/                 # Authentication, email, settings, premium access, helpers
scripts/
├── schema.sql           # Canonical database schema and safe additions
├── seed.sql             # Sample content for local development
└── ielts-library.sql    # Extended IELTS practice library
.github/
└── workflows/           # Repository quality checks
```

## Production checklist

Before a public launch:

- [ ] Set a unique, strong `ADMIN_PASSWORD`; the development fallback must never be used in production.
- [ ] Provision managed PostgreSQL and apply `scripts/schema.sql`.
- [ ] Configure `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
- [ ] Add `EMAIL_USER` and a Google App Password in the hosting provider's environment settings before enabling production email.
- [ ] Fill Premium tier prices, benefits, payment recipient numbers, and instructions in Admin → Payments.
- [ ] Review contact, privacy, terms, and analytics settings in the admin workspace.
- [ ] Back up the database and validate the restore process.
- [ ] Run `npm run typecheck` and `npm run build` before every release.

## Quality and CI

GitHub Actions verifies type safety and production builds on pushes and pull requests to `main`. The workflow uses an isolated PostgreSQL service and applies the schema before building.

The existing ESLint baseline contains legacy findings outside the current feature work. `npm run lint` remains available for incremental cleanup; the enforced CI checks are TypeScript and production build validation.

## Contributing

Contributions and maintenance changes are welcome. Please review [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Security concerns should follow [SECURITY.md](SECURITY.md) rather than being disclosed in a public issue.

## License

A license has not yet been selected for this repository. Do not assume permission for redistribution, commercial reuse, or relicensing until the project owner adds a `LICENSE` file.

---

<div align="center">
  Built for focused IELTS practice in Bangladesh. 🇧🇩
</div>
