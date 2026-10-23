# Contributing to LHBD · IELTS Mock Test

Thanks for helping improve the platform. This guide keeps changes safe, reviewable, and useful for learners.

## Before you start

1. Read the [README](README.md) and configure a local PostgreSQL database.
2. Create a branch from the latest `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/short-description
   ```

3. Keep secrets in `.env.local`. Do not commit credentials, transaction data, learner data, or database dumps.

## Development expectations

- Use TypeScript and keep `strict` type checking clean.
- Keep learner-facing copy clear and respectful; Bangla copy should be natural and proofread.
- Preserve keyboard navigation, focus visibility, responsive layouts, and readable contrast.
- Use the established `@/` import alias and project component patterns.
- Keep a feature narrowly scoped. Avoid unrelated reformatting in the same pull request.
- Do not invent production payment numbers, prices, company addresses, analytics IDs, or sender domains. Use configurable settings instead.

## Database changes

The canonical SQL schema is in `scripts/schema.sql`, while TypeScript definitions live in `src/db/schema.ts`.

For every database change:

1. Update both schema representations.
2. Make SQL additions safe for an existing deployment where practical (`IF NOT EXISTS`, additive migration patterns).
3. Test against a clean local database.
4. Explain the migration impact in the pull request.

Never edit production data directly from a feature branch.

## Validate before opening a pull request

```bash
npm run typecheck
npm run build
```

If your change touches the database, also apply the schema to a clean database:

```bash
npm run db:migrate
```

`npm run lint` is valuable for incremental cleanup. The repository currently has legacy lint findings, so please avoid adding new ones and mention any existing findings that you touch.

## Pull-request checklist

- [ ] I have described the user-facing outcome and any admin impact.
- [ ] I have tested mobile and desktop layouts where the UI changed.
- [ ] I have run `npm run typecheck` and `npm run build`.
- [ ] I updated the documentation or `.env.example` when configuration changed.
- [ ] I did not include secrets, private learner data, payment credentials, or generated build output.
- [ ] I added database migration notes if the schema changed.

## Reporting a vulnerability

Please do **not** file public issues for security vulnerabilities. Follow the process in [SECURITY.md](SECURITY.md).
