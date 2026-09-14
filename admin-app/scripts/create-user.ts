#!/usr/bin/env node
/**
 * CLI: cree ou reset un utilisateur admin.
 *
 * Usage recommande (mot de passe interactif, NON visible dans l'historique shell):
 *   npm run create-user -- --email aalie@example.com
 *   npm run create-user -- --email aalie@example.com --reset
 *
 * Usage rapide (mot de passe en flag — visible dans ~/.bash_history):
 *   npm run create-user -- --email aalie@example.com --password "MotDePasseFort!"
 *
 * ⚠️ Ce script tourne LOCALEMENT (ta machine). Il se connecte au Redis
 * de PRODUCTION (Vercel/Upstash) via REDIS_URL de ton .env.local.
 *
 * Pre-requis:
 *   1. cp .env.example .env.local
 *   2. Coller REDIS_URL depuis Vercel > Settings > Environment Variables
 *   3. Coller IP_HASH_SALT depuis Vercel aussi
 *   4. npm install
 *   5. npm run create-user -- --email ...
 */

import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

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

if (values.help || !values.email) {
  console.log(`
Usage:
  npm run create-user -- --email <email> [--password <pw>] [--role admin|editor] [--reset]

Options:
  -e, --email     Email de l'utilisateur (requis)
  -p, --password  Mot de passe (optionnel — si absent, prompt interactif)
  -r, --role      Role (defaut: admin)
      --reset     Reset le mot de passe d'un utilisateur existant

Exemples (recommandes, mot de passe NON visible dans l'historique):
  npm run create-user -- -e aalie@example.com
  npm run create-user -- -e aalie@example.com --reset

Exemple rapide (mot de passe visible dans ~/.bash_history):
  npm run create-user -- -e aalie@example.com -p "MotDePasseFort123!"
`);
  process.exit(values.help ? 0 : 1);
}

/**
 * Prompt interactif pour saisir un mot de passe sans que les touches
 * apparaissent a l'ecran (masque avec *). Fallback en clair si le TTY
 * ne supporte pas la manipulation raw mode.
 */
async function promptPassword(label: string): Promise<string> {
  // Si stdin n'est pas un TTY (pipe, CI), lire une ligne classique
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(`${label}: `);
    rl.close();
    return answer;
  }
  // TTY: bascule en raw mode pour intercepter chaque touche
  stdout.write(`${label}: `);
  return new Promise<string>((resolve) => {
    let buf = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch: string) => {
      switch (ch) {
        case "\n":
        case "\r":
        case "": // Ctrl+D
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          stdout.write("\n");
          resolve(buf);
          return;
        case "": // Ctrl+C
          stdout.write("\n");
          process.exit(130);
          return;
        case "": // Backspace
        case "\b":
          if (buf.length > 0) {
            buf = buf.slice(0, -1);
            stdout.write("\b \b");
          }
          return;
        default:
          buf += ch;
          stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  // Imports dynamiques APRES le chargement de l'env (les modules validate
  // au chargement). Ici plutot qu'au top-level pour eviter le top-level
  // await refuse par tsx en mode CJS.
  const { createUser, resetPassword, getUserByEmail } = await import("../lib/users");
  const { redis } = await import("../lib/redis");

  const email = (values.email as string).trim().toLowerCase();
  // Password: soit fourni en flag, soit demande en prompt interactif
  let password = values.password as string | undefined;
  if (!password) {
    password = await promptPassword(
      values.reset ? "Nouveau mot de passe" : "Mot de passe"
    );
    if (!password) {
      console.error("❌ Mot de passe vide.");
      process.exit(1);
    }
    // Double-saisie pour eviter les typos (au create seulement — au reset
    // l'admin peut refaire un reset si typo)
    if (!values.reset) {
      const confirm = await promptPassword("Confirmer le mot de passe");
      if (confirm !== password) {
        console.error("❌ Les mots de passe ne correspondent pas.");
        process.exit(1);
      }
    }
  }
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
