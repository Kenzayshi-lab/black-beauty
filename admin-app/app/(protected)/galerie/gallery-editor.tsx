"use client";

/**
 * Editeur de galerie:
 *   - Liste des photos existantes (edit alt/lien, reorder haut/bas, retirer)
 *   - Ajout de nouvelles photos (via UploadModal, differe l'upload)
 *   - Save global qui:
 *     1. Upload chaque photo pending vers /api/media/insta/<filename>
 *     2. PUT la nouvelle galerie.json via /api/content/galerie.json
 *
 * Le "retrait" ne supprime pas le fichier du repo — juste sa reference
 * dans galerie.json. La suppression definitive viendra en 26b.
 */

import { useMemo, useState, useTransition } from "react";
import { UploadModal, type PendingUpload } from "./upload-modal";

type PhotoRef = {
  src: string;
  alt: string;
  link?: string;
};

type GalerieData = {
  hero?: { eyebrow?: string; title?: string; script_sub?: string };
  intro?: string;
  instagram_button_text?: string;
  cta_final?: { eyebrow?: string; title?: string; description?: string; button_text?: string };
  photos: PhotoRef[];
};

type Photo =
  | { kind: "existing"; ref: PhotoRef }
  | { kind: "pending"; ref: PhotoRef; blob: Blob; filename: string; previewUrl: string };

const INSTA_BASE = "/assets/images/insta/";
const INSTA_PATTERN = /^\/assets\/images\/insta\/g(\d+)\.jpg$/;

function nextFilename(all: Photo[]): string {
  let max = 0;
  for (const p of all) {
    const m = INSTA_PATTERN.exec(p.ref.src);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  const next = max + 1;
  return next < 100 ? `g${String(next).padStart(2, "0")}.jpg` : `g${next}.jpg`;
}

function toRef(photo: Photo): PhotoRef {
  const { src, alt, link } = photo.ref;
  const clean: PhotoRef = { src, alt: alt.trim() };
  if (link && link.trim()) clean.link = link.trim();
  return clean;
}

function photosEqual(a: PhotoRef[], b: PhotoRef[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x.src !== y.src || x.alt !== y.alt || (x.link ?? "") !== (y.link ?? "")) return false;
  }
  return true;
}

export function GalleryEditor(props: {
  initialGalerie: GalerieData;
  initialSha: string;
  defaultInstagramLink: string;
}) {
  const [photos, setPhotos] = useState<Photo[]>(
    () => props.initialGalerie.photos.map((ref) => ({ kind: "existing", ref } as Photo))
  );
  const [sha, setSha] = useState(props.initialSha);
  const [baselineRefs, setBaselineRefs] = useState<PhotoRef[]>(props.initialGalerie.photos);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const suggestedFilename = useMemo(() => nextFilename(photos), [photos]);

  const dirty = useMemo(() => {
    return !photosEqual(baselineRefs, photos.map(toRef)) ||
           photos.some((p) => p.kind === "pending");
  }, [photos, baselineRefs]);

  function updatePhoto(index: number, patch: Partial<PhotoRef>) {
    setPhotos((prev) => {
      const next = [...prev];
      const cur = next[index];
      next[index] = { ...cur, ref: { ...cur.ref, ...patch } } as Photo;
      return next;
    });
    setFeedback(null);
  }

  function movePhoto(index: number, delta: -1 | 1) {
    setPhotos((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setFeedback(null);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed.kind === "pending") {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
    setFeedback(null);
  }

  function onUploadConfirmed(upload: PendingUpload) {
    setPhotos((prev) => [
      ...prev,
      {
        kind: "pending",
        ref: {
          src: `${INSTA_BASE}${upload.filename}`,
          alt: upload.alt,
          link: upload.link || undefined
        },
        blob: upload.blob,
        filename: upload.filename,
        previewUrl: upload.previewUrl
      }
    ]);
    setShowUploadModal(false);
    setFeedback(null);
  }

  async function save() {
    setFeedback(null);
    const pendingUploads = photos.filter(
      (p): p is Extract<Photo, { kind: "pending" }> => p.kind === "pending"
    );

    // 1. Upload chaque nouveau binaire — sequentiel pour un feedback progressif
    for (const p of pendingUploads) {
      const res = await fetch(`/api/media/insta/${p.filename}`, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: p.blob
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFeedback({
          kind: "err",
          msg: `Échec upload ${p.filename}: ${err.error ?? `HTTP ${res.status}`}`
        });
        return;
      }
    }

    // 2. Update galerie.json avec la nouvelle liste (on repart des donnees
    // initiales pour ne pas ecraser hero/intro/cta_final, edites plus tard
    // via un ecran dedie).
    const refs = photos.map(toRef);
    const galerieJson = { ...props.initialGalerie, photos: refs };
    const res = await fetch("/api/content/galerie.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: galerieJson,
        sha,
        message: "admin: mise à jour de la galerie via console"
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFeedback({
        kind: "err",
        msg: `Sauvegarde de galerie.json: ${err.error ?? `HTTP ${res.status}`}`
      });
      return;
    }

    const json = (await res.json()) as { contentSha: string };
    setSha(json.contentSha);
    // Marque tous les pending comme existing (les blobs ne sont plus utiles)
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.kind === "pending") URL.revokeObjectURL(p.previewUrl);
        return { kind: "existing", ref: toRef(p) };
      })
    );
    // Nouveau baseline
    setBaselineRefs(refs);
    setFeedback({
      kind: "ok",
      msg: "✅ Sauvegardé. Le site public sera mis à jour dans environ 1 minute (déploiement Vercel)."
    });
  }

  function revert() {
    setPhotos((prev) => {
      // Libere les blobs pending
      for (const p of prev) {
        if (p.kind === "pending") URL.revokeObjectURL(p.previewUrl);
      }
      return baselineRefs.map((ref) => ({ kind: "existing", ref } as Photo));
    });
    setFeedback(null);
  }

  function onSave() {
    startTransition(() => save());
  }

  return (
    <div className="space-y-6">
      {/* Bandeau d'actions sticky */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-noir-profond/95 backdrop-blur border-b border-white/5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          disabled={pending}
          className="px-4 py-2 text-argent-givre text-xs tracking-widest uppercase border border-rose-metal/40 hover:bg-rose-metal/10 disabled:opacity-40 transition-colors"
        >
          + Ajouter une photo
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={onSave}
          className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={revert}
          className="px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Annuler modifs
        </button>
        {dirty && (
          <span className="text-yellow-400/90 text-xs">
            ⚠️ Modifications non sauvegardées
          </span>
        )}
        <div className="flex-1" />
        <a
          href="https://blackandbeautystudio.ca/galerie.html"
          target="_blank"
          rel="noreferrer"
          className="text-rose-metal text-xs tracking-widest uppercase underline underline-offset-4 hover:text-rose-poudre"
        >
          Voir sur le site ↗
        </a>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded text-sm ${
            feedback.kind === "ok"
              ? "bg-green-500/10 border border-green-500/30 text-green-300"
              : "bg-rouge-sang/10 border border-rouge-rubis/30 text-rouge-rubis"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <p className="text-argent-doux/70 text-xs">
        {photos.length} photo{photos.length > 1 ? "s" : ""} —{" "}
        {photos.filter((p) => p.kind === "pending").length > 0 && (
          <span className="text-yellow-400/90">
            {photos.filter((p) => p.kind === "pending").length} nouvelle
            {photos.filter((p) => p.kind === "pending").length > 1 ? "s" : ""} à uploader
          </span>
        )}
      </p>

      {/* Grille des photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => {
          const thumbSrc =
            photo.kind === "pending"
              ? photo.previewUrl
              : `https://blackandbeautystudio.ca${photo.ref.src}`;
          return (
            <div
              key={`${photo.ref.src}-${index}`}
              className={`bg-noir-velours border rounded overflow-hidden ${
                photo.kind === "pending" ? "border-yellow-400/40" : "border-white/5"
              }`}
            >
              <div className="relative aspect-square bg-black">
                <img
                  src={thumbSrc}
                  alt={photo.ref.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {photo.kind === "pending" && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] uppercase tracking-widest rounded">
                    À uploader
                  </span>
                )}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-argent-doux text-[10px] uppercase tracking-widest rounded">
                  #{index + 1}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <label className="block text-argent-doux text-[10px] uppercase tracking-widest mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={photo.ref.alt}
                    onChange={(e) => updatePhoto(index, { alt: e.target.value })}
                    maxLength={200}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-argent-givre text-xs focus:outline-none focus:border-rose-metal/40"
                  />
                </div>
                <div>
                  <label className="block text-argent-doux text-[10px] uppercase tracking-widest mb-1">
                    Lien au clic
                  </label>
                  <input
                    type="url"
                    value={photo.ref.link ?? ""}
                    onChange={(e) => updatePhoto(index, { link: e.target.value })}
                    maxLength={500}
                    placeholder={props.defaultInstagramLink}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-argent-doux text-[11px] font-mono focus:outline-none focus:border-rose-metal/40"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, -1)}
                      disabled={index === 0 || pending}
                      title="Monter"
                      aria-label={`Monter la photo ${index + 1}`}
                      className="w-8 h-8 flex items-center justify-center text-argent-doux border border-white/10 hover:border-rose-metal/40 hover:text-rose-metal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 1)}
                      disabled={index === photos.length - 1 || pending}
                      title="Descendre"
                      aria-label={`Descendre la photo ${index + 1}`}
                      className="w-8 h-8 flex items-center justify-center text-argent-doux border border-white/10 hover:border-rose-metal/40 hover:text-rose-metal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    disabled={pending}
                    className="text-rouge-rubis text-[10px] tracking-widest uppercase border border-rouge-rubis/40 px-2 py-1 hover:bg-rouge-sang/10 disabled:opacity-30 transition-colors"
                  >
                    Retirer
                  </button>
                </div>

                <code className="block text-argent-doux/40 text-[10px] truncate pt-1">
                  {photo.ref.src}
                </code>
              </div>
            </div>
          );
        })}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-16 text-argent-doux">
          Aucune photo dans la galerie. Clique sur « Ajouter une photo » pour commencer.
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          suggestedFilename={suggestedFilename}
          defaultLink={props.defaultInstagramLink}
          onCancel={() => setShowUploadModal(false)}
          onConfirm={onUploadConfirmed}
        />
      )}
    </div>
  );
}
