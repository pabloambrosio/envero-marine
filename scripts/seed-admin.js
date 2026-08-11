// Crea el usuario admin único en la tabla `user`. Idempotente: si el email
// ya existe, no hace nada.
//
// Usa el driver mariadb directo (SQL plano) en vez del client de Prisma:
// el client generado es TypeScript y este script sigue siendo node plano.
//
// Usage: yarn seed:admin
//   (which runs `node --env-file=.env scripts/seed-admin.js`)
//
// Required env vars:
//   DATABASE_URL     mysql://user:pass@host:port/db
//   ADMIN_EMAIL      Admin email
//   ADMIN_PASSWORD   Admin password

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import mariadb from "mariadb";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const missing = Object.entries({
  DATABASE_URL: databaseUrl,
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD: password,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const url = new URL(databaseUrl);
const connection = await mariadb.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
});

try {
  const existing = await connection.query(
    "SELECT id FROM `user` WHERE email = ?",
    [email],
  );

  if (existing.length > 0) {
    console.log(`Admin ${email} already exists (id=${existing[0].id}). Nothing to do.`);
    process.exit(0);
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);

  await connection.query(
    "INSERT INTO `user` (id, email, password_hash, active) VALUES (?, ?, ?, TRUE)",
    [id, email, passwordHash],
  );

  console.log(`Created admin ${email} (id=${id})`);
} finally {
  await connection.end();
}
