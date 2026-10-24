# Security Policy

## Supported version

Security fixes are applied to the latest code on the `main` branch.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a vulnerability, exposed secret, authentication weakness, payment-flow issue, or data-access concern.

Instead, use the repository's private security-advisory reporting option if it is enabled, or contact the project owner privately through GitHub. Include:

- a concise description of the problem;
- steps to reproduce it safely;
- the affected route, component, or commit if known;
- potential impact; and
- any suggested mitigation.

Please avoid accessing, downloading, or sharing learner data while validating a report. The maintainer will acknowledge a good-faith report and coordinate remediation privately.

## Security practices for operators

Before public deployment:

- Set a long, unique `ADMIN_PASSWORD`. The code contains a development fallback and it must not be used in production.
- Keep `DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, and all sender credentials in the hosting provider's secret manager or `.env.local` only.
- Use a Google App Password with 2-Step Verification for Gmail SMTP; never use the Gmail account's normal password.
- Terminate traffic over HTTPS and set `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.
- Restrict PostgreSQL network access, create backups, and test restoration.
- Review staff accounts and payment-request access regularly.
- Rotate credentials immediately if a secret is exposed.

## Secret-handling rule

Never commit `.env` files, Gmail App Passwords, database backups, personal data, payment wallet credentials, or session tokens. The repository's `.gitignore` deliberately permits only `.env.example`, which contains placeholders only.
