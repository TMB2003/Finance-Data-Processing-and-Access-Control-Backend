import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

// Neon Serverless PostgreSQL (for production/serverless)
export const sql_neon = process.env["DATABASE_URL"]
  ? neon(process.env["DATABASE_URL"])
  : null;

// Local PostgreSQL (for development)
export const sql_db = postgres({
  host: process.env["PGHOST"] || "localhost",
  port: parseInt(process.env["PGPORT"] || "5432"),
  database: process.env["PGDATABASE"] || "records_db",
  username: process.env["PGUSER"] || "taha",
  password: process.env["PGPASSWORD"] || "",
});
