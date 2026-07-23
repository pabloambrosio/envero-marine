// Creates the single admin user via the Supabase Auth admin API. Idempotent:
// re-running with the same email is a no-op.
//
// Usage: yarn seed:admin
//   (which runs `node --env-file=.env scripts/seed-admin.js`)
//
// Required env vars:
//   PUBLIC_SUPABASE_URL    Supabase API URL
//   SUPABASE_SECRET_KEY    Service-role key. Server-only — never expose to browser.
//   ADMIN_EMAIL            Admin email
//   ADMIN_PASSWORD         Must satisfy supabase/config.toml password rules

import { createClient } from "@supabase/supabase-js";

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const missing = Object.entries({
  PUBLIC_SUPABASE_URL: url,
  SUPABASE_SECRET_KEY: secret,
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD: password,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// No hay tabla app_user para consultar — se busca directo en auth.users.
const { data: listed, error: listErr } = await supabase.auth.admin.listUsers();

if (listErr) {
  console.error("Lookup failed:", listErr.message);
  process.exit(1);
}

const existing = listed.users.find((u) => u.email === email);

if (existing) {
  console.log(`Admin ${email} already exists (id=${existing.id}). Nothing to do.`);
  process.exit(0);
}

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createErr) {
  console.error("auth.admin.createUser failed:", createErr.message);
  process.exit(1);
}

console.log(`Created admin ${email} (id=${created.user.id})`);
