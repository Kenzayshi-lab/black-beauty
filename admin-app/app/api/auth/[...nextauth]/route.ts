/**
 * Endpoints Auth.js (login, logout, session, callback).
 * Route dynamique catch-all — Auth.js gere le routing interne.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
