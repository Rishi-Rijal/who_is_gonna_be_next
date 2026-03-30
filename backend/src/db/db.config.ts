import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: true,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("Connected to Neon Postgres");
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
  process.exit(1);
});

export const db = drizzle(pool, { schema });

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection verified");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
