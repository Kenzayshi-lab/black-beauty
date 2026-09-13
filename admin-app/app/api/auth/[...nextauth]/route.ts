/**
 * Endpoints Auth.js (login, logout, session, callback).
 * Route dynamique catch-all — Auth.js gere le routing interne.
 *
 * Runtime Node explicite: auth.ts charge Argon2 (module natif) et ioredis
 * (utilise node:diagnostics_channel), incompatibles avec Edge.
 */

import { handlers } from "@/auth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;
