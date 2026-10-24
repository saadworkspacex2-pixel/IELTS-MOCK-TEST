import { pool } from "@/db";

// Safe, additive migration for payment/admin endpoints. It self-heals a database
// when a hosting build did not run the normal schema migration before an API call.
export async function ensurePremiumOperationsSchema() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS lhbd_app;
    ALTER TABLE lhbd_app.exams ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'free';
    ALTER TABLE lhbd_app.resources ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'free';
    ALTER TABLE lhbd_app.users ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'free';
    ALTER TABLE lhbd_app.users ADD COLUMN IF NOT EXISTS premium_until timestamp;
    ALTER TABLE lhbd_app.attempts ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
    CREATE TABLE IF NOT EXISTS lhbd_app.payment_requests (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES lhbd_app.users(id) ON DELETE CASCADE,
      tier text NOT NULL,
      payment_method text NOT NULL,
      transaction_id text NOT NULL,
      sender_number text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      admin_note text NOT NULL DEFAULT '',
      receipt_code text NOT NULL DEFAULT '',
      receipt_token text NOT NULL DEFAULT '',
      approved_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
    ALTER TABLE lhbd_app.payment_requests ADD COLUMN IF NOT EXISTS receipt_code text NOT NULL DEFAULT '';
    ALTER TABLE lhbd_app.payment_requests ADD COLUMN IF NOT EXISTS receipt_token text NOT NULL DEFAULT '';
    ALTER TABLE lhbd_app.payment_requests ADD COLUMN IF NOT EXISTS approved_at timestamp;
  `);
}
