/**
 * Config Firebase — module NEUTRE (ni "use client", ni serveur).
 *
 * ⚠️ IMPORTANT : ces constantes sont importées à la fois côté client
 * (lib/firebase-client.ts) ET côté serveur/Edge (lib/firebase-token.ts,
 * middleware). Elles DOIVENT donc vivre dans un module sans directive
 * "use client" : sinon, quand du code serveur importe une valeur d'un
 * module "use client", Next.js lui donne une *référence client* au lieu de
 * la vraie valeur → FIREBASE_PROJECT_ID devient undefined côté serveur →
 * l'issuer/audience du token ne correspondent plus → toute vérification
 * échoue (401). Ne remets jamais "use client" en haut de ce fichier.
 *
 * La config est PUBLIQUE par conception (elle part de toute façon dans le JS
 * du navigateur). La sécurité repose sur la vérification des tokens côté
 * serveur + la liste blanche, pas sur le secret de ces valeurs.
 *
 * Projet : blackandbeautystudio-464a9
 */

export const firebaseConfig = {
  apiKey: "AIzaSyA6JGk5QBtjLpZsZ6_bko-7Juaow7NTZZU",
  authDomain: "blackandbeautystudio-464a9.firebaseapp.com",
  projectId: "blackandbeautystudio-464a9",
  storageBucket: "blackandbeautystudio-464a9.firebasestorage.app",
  messagingSenderId: "760313723100",
  appId: "1:760313723100:web:167ec61bc4fc47117c5c19"
} as const;

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
