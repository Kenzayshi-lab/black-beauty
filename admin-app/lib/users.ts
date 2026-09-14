/**
 * CRUD utilisateurs stocke dans Redis.
 *
 * Schema JSON par utilisateur (cle: bb:user:{id}):
 *   {
 *     id:             uuid v4
 *     email:          string (lowercased)
 *     passwordHash:   string (Argon2id)
 *     role:           "admin" | "editor"
 *     createdAt:      ISO 8601
 *     lastLoginAt:    ISO 8601 | null
 *     mfaSecret:      string (chiffre) | null   -- chunk 22
 *     mfaEnabled:     boolean                    -- chunk 22
 *   }
 *
 * Index secondaire (email -> id):
 *   cle: bb:user:email:{email}
 *   valeur: id
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redis, KEY } from "./redis";
import { hashPassword } from "./password";

export const UserSchema = z.object({
  id:             z.string().uuid(),
  email:          z.string().email().toLowerCase(),
  passwordHash:   z.string().startsWith("$argon2"),
  role:           z.enum(["admin", "editor"]).default("admin"),
  createdAt:      z.string().datetime(),
  lastLoginAt:    z.string().datetime().nullable().default(null),
  mfaSecret:      z.string().nullable().default(null),
  mfaEnabled:     z.boolean().default(false),
  // Incremente a chaque "kick all sessions" ou reset password.
  // Toute session dont le JWT porte un sessionVersion different est invalidee
  // au premier appel d'auth() cote Node (voir auth.ts).
  sessionVersion: z.number().int().nonnegative().default(1)
});

export type User = z.infer<typeof UserSchema>;

// Version "safe" sans champs sensibles (a exposer au client / a la session).
// sessionVersion est inclus pour que le callback jwt puisse le porter dans
// le token au moment du login.
export type PublicUser = Pick<User, "id" | "email" | "role" | "sessionVersion">;

export function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion ?? 1
  };
}

/**
 * Cree un nouvel utilisateur. Echoue si l'email existe deja.
 * Le mot de passe est hashe avec Argon2id ici — l'appelant passe le plaintext.
 */
export async function createUser(input: {
  email: string;
  password: string;
  role?: "admin" | "editor";
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) {
    throw new Error(`Email invalide: ${email}`);
  }

  const existingId = await redis().get(KEY.userByEmail(email));
  if (existingId) {
    throw new Error(`Un utilisateur avec l'email ${email} existe deja (id: ${existingId})`);
  }

  const passwordHash = await hashPassword(input.password);
  const user: User = UserSchema.parse({
    id:             randomUUID(),
    email,
    passwordHash,
    role:           input.role ?? "admin",
    createdAt:      new Date().toISOString(),
    lastLoginAt:    null,
    mfaSecret:      null,
    mfaEnabled:     false,
    sessionVersion: 1
  });

  // Atomique: user + index email en une seule commande MULTI
  await redis()
    .multi()
    .set(KEY.user(user.id), JSON.stringify(user))
    .set(KEY.userByEmail(user.email), user.id)
    .exec();

  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  if (!z.string().uuid().safeParse(id).success) return null;
  const raw = await redis().get(KEY.user(id));
  if (!raw) return null;
  try {
    return UserSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const id = await redis().get(KEY.userByEmail(normalized));
  if (!id) return null;
  return getUserById(id);
}

/**
 * Met a jour lastLoginAt. Appele apres une connexion reussie.
 */
export async function touchLastLogin(id: string): Promise<void> {
  const user = await getUserById(id);
  if (!user) return;
  user.lastLoginAt = new Date().toISOString();
  await redis().set(KEY.user(id), JSON.stringify(user));
}

/**
 * Reinitialise le mot de passe d'un utilisateur existant.
 * Utilise par le CLI create-user avec --reset.
 *
 * Bump automatiquement sessionVersion pour invalider toutes les sessions
 * en cours (Fix audit #6).
 */
export async function resetPassword(email: string, newPassword: string): Promise<User> {
  const user = await getUserByEmail(email);
  if (!user) throw new Error(`Utilisateur introuvable: ${email}`);
  user.passwordHash = await hashPassword(newPassword);
  user.sessionVersion = (user.sessionVersion ?? 1) + 1;
  await redis().set(KEY.user(user.id), JSON.stringify(user));
  return user;
}

/**
 * Incremente sessionVersion pour invalider toutes les sessions actives
 * de l'utilisateur. Utilise par le "kill switch" (deconnecter tous mes appareils).
 *
 * Le check reel se fait dans le callback jwt cote Node (auth.ts):
 * a chaque refresh de token, on compare token.sessionVersion avec
 * user.sessionVersion; si different, la session est refusee et l'user
 * est redirige vers /login.
 */
export async function bumpSessionVersion(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) throw new Error(`Utilisateur introuvable: ${userId}`);
  user.sessionVersion = (user.sessionVersion ?? 1) + 1;
  await redis().set(KEY.user(user.id), JSON.stringify(user));
  return user.sessionVersion;
}
