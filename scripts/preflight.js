#!/usr/bin/env node
/**
 * Preflight check: verifieer verplichte environment variables vóór build.
 * Draait automatisch via npm run build (prebuild hook).
 */

const fs = require("fs");
const path = require("path");

// Laad .env indien aanwezig (zelfde formaat als Vite)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const required = [
  {
    name: "PUBLIC_WEB_URL of PUBLIC_APP_URL",
    check: () =>
      process.env.PUBLIC_WEB_URL || process.env.PUBLIC_APP_URL,
  },
  {
    name: "PUBLIC_SUPABASE_URL",
    check: () => process.env.PUBLIC_SUPABASE_URL,
  },
  {
    name: "PUBLIC_SUPABASE_ANON_KEY",
    check: () => process.env.PUBLIC_SUPABASE_ANON_KEY,
  },
];

const missing = required.filter((r) => !r.check());

if (missing.length > 0) {
  console.error("Preflight failed: ontbrekende environment variables:\n");
  missing.forEach((r) => console.error(`  - ${r.name}`));
  console.error("\nZet deze in .env of in je buildomgeving. Zie docs/DEPLOYMENT.md.");
  process.exit(1);
}

console.log("Preflight OK: alle verplichte env vars aanwezig.");
