"use client";

/**
 * Initialisation Firebase cote NAVIGATEUR (client).
 *
 * La config ci-dessous est PUBLIQUE par conception (elle part de toute facon
 * dans le JS du navigateur). Ce ne sont pas des secrets — la securite repose
 * sur les regles Firebase + la verification des tokens cote serveur
 * (voir lib/firebase-token.ts), pas sur le secret de ces valeurs.
 *
 * Projet : blackandbeautystudio-464a9
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "@firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from "@firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Singleton — evite de reinitialiser Firebase a chaque hot-reload.
let app: FirebaseApp;
let authInstance: Auth | null = null;

export function firebaseApp(): FirebaseApp {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(firebaseApp());
  // Persistance locale : la session survit a la fermeture de l'onglet.
  // (best-effort — ignore l'erreur si le navigateur bloque le storage)
  setPersistence(authInstance, browserLocalPersistence).catch(() => {});
  return authInstance;
}

// Note : FIREBASE_PROJECT_ID vit désormais dans ./firebase-config (module
// neutre) pour que le code serveur/Edge puisse l'importer sans passer par ce
// fichier "use client" (sinon la valeur arrive en référence client = undefined
// côté serveur → échec de vérif des tokens).
export { FIREBASE_PROJECT_ID } from "./firebase-config";
