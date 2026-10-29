// shortcut: single-process JSON file store for localhost testing only; Supabase replaces it once keys are set.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DEMO_PRODUCTS, DEMO_RATES } from "./demo";
import type { Product } from "./types";
import type { Rates } from "./price";

export const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "demo-db.json");

export type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type DB = {
  secret: string;
  users: { id: string; email: string; role: "admin" | "customer"; hash: string; salt: string }[];
  products: Product[];
  rates: Rates;
  settings: { paymentsEnabled: boolean };
  orders: Row[];
  customs: Row[];
};

export const hashPassword = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString("hex");
export function checkPassword(pw: string, salt: string, hash: string) {
  const a = Buffer.from(hashPassword(pw, salt), "hex"), b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function seed(): DB {
  const pw = () => randomBytes(6).toString("base64url");
  const accounts = [["admin@wp-ornaments.test", "admin", pw()], ["customer@wp-ornaments.test", "customer", pw()]] as const;
  const users = accounts.map(([email, role, p]) => { const salt = randomBytes(8).toString("hex"); return { id: randomUUID(), email, role, salt, hash: hashPassword(p, salt) }; });
  writeFileSync(join(process.cwd(), "DEMO_ACCOUNTS.md"),
    `# Local test accounts (demo mode only)\n\nWork only on localhost without Supabase keys; disabled in production.\nDelete .data/ to regenerate.\n\n| Role | Email | Password |\n|---|---|---|\n${accounts.map(([e, r, p]) => `| ${r} | ${e} | ${p} |`).join("\n")}\n`);
  return { secret: randomBytes(32).toString("hex"), users, products: DEMO_PRODUCTS, rates: DEMO_RATES, settings: { paymentsEnabled: false }, orders: [], customs: [] };
}

// Production without Supabase: read-only catalogue, no users, so nothing can log in or be written.
const READONLY: DB = { secret: "", users: [], products: DEMO_PRODUCTS, rates: DEMO_RATES, settings: { paymentsEnabled: false }, orders: [], customs: [] };

export function readDB(): DB {
  if (process.env.NODE_ENV === "production") return READONLY;
  if (!existsSync(FILE)) { mkdirSync(DIR, { recursive: true }); writeFileSync(FILE, JSON.stringify(seed(), null, 2)); }
  return JSON.parse(readFileSync(FILE, "utf8"));
}

export function writeDB(fn: (db: DB) => void) {
  if (process.env.NODE_ENV === "production") throw new Error("Demo store is read-only in production; configure Supabase.");
  const db = readDB();
  fn(db);
  writeFileSync(FILE, JSON.stringify(db, null, 2));
}
