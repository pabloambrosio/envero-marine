// Creates the initial admin user via the Supabase Auth admin API and inserts
// the matching row in public.app_user. Idempotent: re-running with the same
// email is a no-op.
//
// Usage: yarn seed:admin
//   (which runs `node --env-file=.env scripts/seed-admin.js`)
//
// Required env vars:
//   PUBLIC_SUPABASE_URL    Supabase API URL
//   SUPABASE_SECRET_KEY    Service-role key. Server-only — never expose to browser.
//   ADMIN_EMAIL            Admin email
//   ADMIN_PASSWORD         Must satisfy supabase/config.toml password rules
//   ADMIN_NAME             Display name for app_user.name

import { createClient } from "@supabase/supabase-js";

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME;

const missing = Object.entries({
  PUBLIC_SUPABASE_URL: url,
  SUPABASE_SECRET_KEY: secret,
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD: password,
  ADMIN_NAME: name,
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

const { data: existing, error: lookupErr } = await supabase
  .from("app_user")
  .select("id")
  .eq("email", email)
  .maybeSingle();

if (lookupErr) {
  console.error("Lookup failed:", lookupErr.message);
  process.exit(1);
}

if (existing) {
  console.log(`Admin ${email} already exists (id=${existing.id}). Nothing to do.`);
  process.exit(0);
}

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
});

if (createErr) {
  console.error("auth.admin.createUser failed:", createErr.message);
  process.exit(1);
}

const userId = created.user.id;

const { error: insertErr } = await supabase.from("app_user").insert({
  id: userId,
  email,
  name,
  role: "admin",
  active: true,
});

if (insertErr) {
  // Roll back the auth user so we don't leave an orphan with no app_user row.
  const { error: rollbackErr } = await supabase.auth.admin.deleteUser(userId);
  if (rollbackErr) {
    console.error(
      `app_user insert failed AND rollback of auth user ${userId} failed.`,
      `Insert error: ${insertErr.message}`,
      `Rollback error: ${rollbackErr.message}`,
    );
  } else {
    console.error(
      `app_user insert failed (auth user rolled back): ${insertErr.message}`,
    );
  }
  process.exit(1);
}

console.log(`Created admin ${email} (id=${userId})`);
