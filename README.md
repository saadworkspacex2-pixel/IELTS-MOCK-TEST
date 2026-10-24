<div align="center">

# 🎯 LHBD · IELTS Mock Test

### *A Bengali-first online IELTS preparation and mock-exam platform*

[![Quality Checks](https://img.shields.io/github/actions/workflow/status/saadworkspacex2-pixel/IELTS-MOCK-TEST/quality.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=CI%20Quality)](https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br />

[✨ **Features**](#-features) • [🚀 **Quick Start**](#-quick-start) • [⚙️ **Configuration**](#️-configuration) • [📂 **Project Structure**](#-project-structure) • [🤝 **Contributing**](#-contributing)

<br />

---

</div>

## 📌 Overview

**LHBD · IELTS Mock Test** is a responsive, Bengali-first practice platform designed specifically for IELTS learners in Bangladesh. It combines realistic timed exams, instant automated scoring, detailed performance analytics, curated learning resources, and a powerful administrative workspace into one seamless web application.

Built on **Next.js App Router**, **TypeScript**, **PostgreSQL**, and **Drizzle ORM**, the platform supports both free and premium access models, complete with localized manual payment workflows tailored for Bangladeshi payment gateways (bKash, Nagad, Rocket, Upay).

> 🌐 **Bangla-First Experience:** The learner interface, onboarding guides, and navigation instructions are primarily presented in **Bangla**, allowing students to focus 100% on building their IELTS competencies rather than figuring out the UI.

---

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎯 Learner Experience</h3>
      <ul>
        <li><b>Realistic Test Suite:</b> Timed Reading, Listening, Writing, and interactive gap-fill/MCQ modules.</li>
        <li><b>Exam Navigation:</b> Section jump controls, progress bars, question flagging, and autosaved state.</li>
        <li><b>Fullscreen Exam Mode:</b> One-click focus mode with graceful fallback options.</li>
        <li><b>Instant & Manual Scoring:</b> Automated grading for objective sections with instructor submission hooks for Writing evaluations.</li>
        <li><b>Analytics & Reports:</b> Learner dashboards, printable performance reports, historical tracking, and global leaderboards.</li>
        <li><b>Contextual Bangla Guides:</b> Walkthroughs that trigger right inside specific test workflows.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🛠️ Admin Workspace</h3>
      <ul>
        <li><b>Content Management:</b> Full CRUD control over exams, modules, media assets, test resources, and results.</li>
        <li><b>Access Controls:</b> Set content access rules with granular <code>Free</code> and <code>Premium</code> flags.</li>
        <li><b>Operational Dashboard:</b> Manage staff roles, learner profiles, leaderboard visibility, and global themes.</li>
        <li><b>Admin Onboarding:</b> Dedicated Bengali tours for test creation and administrative tools.</li>
        <li><b>SEO Engine:</b> Page-by-page SEO suite (title, description, canonical tags, preview metadata, and hashtags).</li>
        <li><b>Tier & Pricing Controls:</b> Dynamic configuration for Premium tiers, features, pricing, and approval workflows.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💳 Localized Payments</h3>
      <ul>
        <li><b>Tier System:</b> Flexible membership tiers (e.g., <i>Starter</i>, <i>Plus</i>, <i>Pro</i>).</li>
        <li><b>MFS Support:</b> Built-in workflows for <b>bKash</b>, <b>Nagad</b>, <b>Rocket</b>, and <b>Upay</b> send-money requests.</li>
        <li><b>Verification Inbox:</b> Manual Transaction ID submission, admin review, approval/rejection, and instant tier provisioning.</li>
        <li><b>Automated Receipts:</b> PDF generation with verification tokens, security hashes, and purchase summary.</li>
        <li><b>Zero Hardcoding:</b> Fully configurable payment numbers and rates from the admin panel.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>✉️ Communication & Security</h3>
      <ul>
        <li><b>Auth Suite:</b> Secure registration, session management, and rate-limited OTP password recovery.</li>
        <li><b>Transactional Mail:</b> Integrated Gmail SMTP / Nodemailer delivery for lifecycle events.</li>
        <li><b>Mail Studio:</b> In-app rich text editor with template customization, brand logos, dynamic variables, and live previews.</li>
        <li><b>Privacy & Compliance:</b> Built-in consent panels, automated sitemaps, robots.txt, and privacy terms.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 💻 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [React Spring](https://www.react-spring.dev/) |
| **Typography** | Hind Siliguri (Bangla), Manrope (Latin) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/), `pg` |
| **Email Service** | [Nodemailer](https://nodemailer.com/) with Gmail SMTP integration |
| **CI / Quality** | GitHub Actions, ESLint, TypeScript Strict Compiler |

---

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: `v20.9+`
* **npm**: `v10+`
* **PostgreSQL**: A running local or remote instance
* **psql** CLI *(Optional: for seeding initial sample data)*

### 2. Clone & Install

```bash
# Clone the repository
git clone [https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST.git](https://github.com/saadworkspacex2-pixel/IELTS-MOCK-TEST.git)

# Enter project directory
cd IELTS-MOCK-TEST

# Install dependencies using clean install
npm ci
