import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to apply the database schema. Set it in your environment before building.",
  );
}

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
const schemaSql = await readFile(schemaPath, "utf8");
const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(schemaSql);
  console.log("✓ Database schema is up to date.");
} finally {
  await pool.end();
}
