import { pool } from "@/db";

export type PremiumSchemaCapabilities = {
  paymentTable: boolean;
  receiptReady: boolean;
};

// Read-only capability check. It keeps core Premium operations available on a
// production database that has the earlier payment table but has not yet run
// the optional receipt-column migration.
export async function premiumSchemaCapabilities(): Promise<PremiumSchemaCapabilities> {
  const result = await pool.query<{ table_name: string; column_name: string }>(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'lhbd_app'
      AND table_name IN ('payment_requests', 'users')
  `);
  const paymentColumns = new Set(result.rows.filter((row) => row.table_name === "payment_requests").map((row) => row.column_name));
  return {
    paymentTable: paymentColumns.size > 0,
    receiptReady: paymentColumns.has("receipt_code") && paymentColumns.has("receipt_token") && paymentColumns.has("approved_at"),
  };
}

export const premiumSchemaWarning = (capabilities: PremiumSchemaCapabilities) =>
  !capabilities.paymentTable
    ? "Payment inbox database table এখনও তৈরি হয়নি; Manual Premium activation ব্যবহার করা যাবে, তবে payment request inbox পেতে scripts/schema.sql migration চালান।"
    : !capabilities.receiptReady
      ? "Premium access চালু করা যাবে, কিন্তু receipt PDF চালুর জন্য scripts/schema.sql migration এখনও বাকি।"
      : "";
