#!/usr/bin/env node
/**
 * CLI: cree ou reset un utilisateur admin.
 *
 * Usage (depuis admin-app/):
 *   npm run create-user -- --email aalie@example.com --password "MotDePasseFort123!"
 *   npm run create-user -- --email aalie@example.com --password "..." --reset
 *
 * ⚠️ Ce script tourne LOCALEMENT (ta machine). Il se connecte au Redis
 * de PRODUCTION (Vercel/Upstash) via REDIS_URL de ton .env.local.
 *
 * Pre-requis:
 *   1. cp .env.example .env.local
 *   2. Coller REDIS_URL depuis Vercel > Settings > Environment Variables
 *   3. Coller IP_HASH_SALT depuis Vercel aussi
 *   4. npm install
 *   5. npm run create-user -- --email ... --password ...
 */

import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Charge .env.local manuellement (pas de dotenv, on garde 0 dep)
function loadEnv() {
  const path = join(process.cwd(), ".env.local");
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      console.error("❌ .env.local introuvable dans admin-app/");
      console.error("   cp .env.example .env.local puis remplis REDIS_URL + IP_HASH_SALT");
      process.exit(1);
    }
    throw e;
  }
}

loadEnv();

const { values } = parseArgs({
  options: {
    email:    { type: "string", short: "e" },
    password: { type: "string", short: "p" },
    role:     { type: "string", short: "r", default: "admin" },
    reset:    { type: "boolean", default: false },
    help:     { type: "boolean", short: "h", default: false }
  }
});

if (values.help || !values.email || !values.password) {
  console.log(`
Usage:
  npm run create-user -- --email <email> --password <password> [--role admin|editor] [--reset]

Options:
  -e, --email     Email de l'utilisateur (requis)
  -p, --password  Mot de passe (requis, min 8 caracteres)
  -r, --role      Role (defaut: admin)
      --reset     Reset le mot de passe d'un utilisateur existant

Exemple:
  npm run create-user -- -e aalie@example.com -p "MotDePasseFort123!"
`);
  process.exit(values.help ? 0 : 1);
}

// Imports dynamiques APRES le chargement de l'env (les modules validate au chargement)
const { createUser, resetPassword, getUserByEmail } = await import("../lib/users.ts");
const { redis } = await import("../lib/redis.ts");

async function main() {
  const email = values.email as string;
  const password = values.password as string;
  const role = (values.role === "editor" ? "editor" : "admin") as "admin" | "editor";

  console.log(`\n🔐 ${values.reset ? "Reset mot de passe" : "Creation utilisateur"} pour ${email}...`);

  if (values.reset) {
    const user = await resetPassword(email, password);
    console.log(`✅ Mot de passe reinitialise pour ${user.email} (id: ${user.id})`);
  } else {
    const existing = await getUserByEmail(email);
    if (existing) {
      console.error(`❌ L'utilisateur ${email} existe deja (id: ${existing.id})`);
      console.error(`   Utilise --reset si tu veux changer son mot de passe.`);
      process.exit(1);
    }
    const user = await createUser({ email, password, role });
    console.log(`✅ Utilisateur cree:`);
    console.log(`   ID:    ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`\n🎯 Prochaine etape: se connecter sur https://admin.blackandbeautystudio.ca/login`);
  }

  redis().disconnect();
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(`\n❌ Erreur:`, err instanceof Error ? err.message : err);
  process.exit(1);
});
