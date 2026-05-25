#!/usr/bin/env node
import { neon } from "@neondatabase/serverless";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = join(__dirname, "..", ".env.local");

let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL && existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^DATABASE_URL=(.+)$/);
    if (match) DATABASE_URL = match[1];
  }
}

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const demoEmails = [
  "demo@jblbizlaw.com",
  "admin@jblbizlaw.com",
  "superadmin@jblbizlaw.com",
];

const demoUsers = await sql`
  select id from users
  where lower(email) = any(${demoEmails})
     or lower(coalesce(display_name, '')) like '%demo%'
`;
const demoUserIds = demoUsers.map((row) => row.id);

if (demoUserIds.length) {
  await sql`delete from users where id = any(${demoUserIds})`;
}

console.log(`Removed ${demoUserIds.length} demo users and their cascading demo data.`);
