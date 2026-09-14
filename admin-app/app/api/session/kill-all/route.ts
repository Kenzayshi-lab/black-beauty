/**
 * POST /api/session/kill-all
 *
 * Bump user.sessionVersion en Redis. Au prochain appel `auth()` cote Node
 * (server component, route handler), le callback jwt compare le token avec
 * la version en base et invalide la session si different.
 *
 * En pratique: dès qu'une autre session navigue vers une page protégée
 * (dashboard, /theme, etc.), elle est kickee et redirigee vers /login.
 *
 * L'appelant est aussi kicke — le frontend fait un signOut client-side apres.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { bumpSessionVersion } from "@/lib/users";
import { logAuditEvent } from "@/lib/audit-log";
import { hashIp } from "@/lib/ip";

export const runtime = "nodejs";

type SessionUser = { id?: string; email?: string };

function extractIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip === "unknown" ? "unknown" : hashIp(ip);
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  if (!user.id) {
    return NextResponse.json({ error: "Session sans id" }, { status: 400 });
  }

  const ipHash = extractIpHash(request);
  const userAgent = request.headers.get("user-agent");

  try {
    const newVersion = await bumpSessionVersion(user.id);
    await logAuditEvent({
      action: "logout",
      actorUserId: user.id,
      actorEmail: user.email ?? null,
      target: null,
      ipHash,
      userAgent,
      details: { kind: "kill_all_sessions", newSessionVersion: newVersion }
    });
    return NextResponse.json({ ok: true, sessionVersion: newVersion });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
