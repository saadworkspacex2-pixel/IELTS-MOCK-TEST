import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { applyAcademicMockLibrary } from "./academic-mock-library.mjs";
import { applyLhbdCourseMockLibrary } from "./lhbd-course-library.mjs";

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
  await applyAcademicMockLibrary(pool);
  await applyLhbdCourseMockLibrary(pool);
  // Existing installations and the guarded mock-library installer may have
  // rows created before exam ordering existed. Give only unnumbered rows a
  // stable initial position without overwriting an admin's chosen order.
  await pool.query(`
    WITH current_max AS (
      SELECT COALESCE(MAX(sort_order), 0) AS position
      FROM lhbd_app.exams
      WHERE sort_order > 0
    ),
    unordered AS (
      SELECT id, row_number() OVER (ORDER BY created_at DESC, id DESC) AS position
      FROM lhbd_app.exams
      WHERE sort_order = 0
    )
    UPDATE lhbd_app.exams
    SET sort_order = current_max.position + unordered.position
    FROM current_max, unordered
    WHERE exams.id = unordered.id
  `);
} finally {
  await pool.end();
}
