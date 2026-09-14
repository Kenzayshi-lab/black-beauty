"use client";

/**
 * Modal d'upload d'une photo:
 *   1. Selection d'un fichier image
 *   2. Compression cote navigateur (Canvas API): fit-cover centre 1080x1080,
 *      JPEG q82, EXIF orientation via createImageBitmap
 *   3. Aperçu du resultat
 *   4. Saisie alt-text (obligatoire) + lien (optionnel, prerempli)
 *   5. Ajout a la liste locale (l'upload reel se fait au save global)
 *
 * Ne fait AUCUN appel reseau — juste de la manipulation locale.
 */

import { useEffect, useRef, useState } from "react";

const TARGET_SIZE = 1080;
const JPEG_QUALITY = 0.82;
const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15 MB brut max en entree (avant compression)
const MAX_COMPRESSED_BYTES = 2 * 1024 * 1024; // 2 MB apres compression (limite serveur)

export type PendingUpload = {
  filename: string;
  blob: Blob;
  alt: string;
  link: string;
  previewUrl: string;
};

export function UploadModal(props: {
  suggestedFilename: string;
  defaultLink: string;
  onCancel: () => void;
  onConfirm: (upload: PendingUpload) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [alt, setAlt] = useState("");
  const [link, setLink] = useState(props.defaultLink);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Libere l'URL objet a la fermeture pour eviter les fuites memoire
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function compressFile(file: File): Promise<Blob> {
    if (file.size > MAX_RAW_BYTES) {
      throw new Error(
        `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB, max ${MAX_RAW_BYTES / 1024 / 1024} MB).`
      );
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("Le fichier n'est pas une image.");
    }

    // createImageBitmap gere l'EXIF orientation nativement
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fallback pour vieux navigateurs sans imageOrientation
      bitmap = await createImageBitmap(file);
    }

    // Fit-cover centre sur un carre 1080x1080
    const srcMin = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - srcMin) / 2;
    const sy = (bitmap.height - srcMin) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas non disponible");
    ctx.drawImage(bitmap, sx, sy, srcMin, srcMin, 0, 0, TARGET_SIZE, TARGET_SIZE);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) throw new Error("La conversion JPEG a echoue");
    if (blob.size > MAX_COMPRESSED_BYTES) {
      throw new Error(
        `L'image compressee reste trop grosse (${(blob.size / 1024).toFixed(0)} KB, max ${MAX_COMPRESSED_BYTES / 1024} KB).`
      );
    }
    return blob;
  }

  async function handleFile(file: File) {
    setError(null);
    setProcessing(true);
    try {
      const blob = await compressFile(file);
      // Nouvelle URL de preview (revoke l'ancienne)
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setCompressedBlob(null);
      setCompressedSize(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setProcessing(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!compressedBlob || !previewUrl) {
      setError("Selectionne d'abord une image.");
      return;
    }
    const trimmedAlt = alt.trim();
    if (!trimmedAlt) {
      setError("Le texte alternatif est obligatoire (accessibilité).");
      return;
    }
    const trimmedLink = link.trim();
    if (trimmedLink && !/^https:\/\//.test(trimmedLink)) {
      setError("Le lien doit commencer par https://");
      return;
    }
    props.onConfirm({
      filename: props.suggestedFilename,
      blob: compressedBlob,
      alt: trimmedAlt,
      link: trimmedLink || props.defaultLink,
      previewUrl
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <form
        onSubmit={onSubmit}
        className="bg-noir-velours border border-white/10 max-w-lg w-full p-6 rounded my-8"
      >
        <h3 id="upload-modal-title" className="font-titre text-lg text-argent-givre mb-4">
          Ajouter une photo
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-argent-givre text-sm font-medium mb-1">
              Fichier image (JPEG, PNG, HEIC…)
            </label>
            <p className="text-argent-doux/60 text-[11px] mb-2">
              L'image sera automatiquement recadrée en carré 1080×1080 et compressée.
              Max 15 MB en entrée.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
              className="block w-full text-argent-doux text-sm file:mr-3 file:py-2 file:px-4 file:border file:border-white/10 file:bg-black/40 file:text-argent-givre file:text-xs file:uppercase file:tracking-widest file:cursor-pointer hover:file:border-rose-metal/40"
            />
          </div>

          {processing && (
            <p className="text-argent-doux text-xs italic">
              ⏳ Compression en cours…
            </p>
          )}

          {previewUrl && !processing && (
            <div className="border border-white/10 rounded p-3 bg-black/40">
              <p className="text-argent-doux text-[11px] uppercase tracking-widest mb-2">
                Aperçu (
                {compressedSize
                  ? `${(compressedSize / 1024).toFixed(0)} KB`
                  : "?"}
                )
              </p>
              <img
                src={previewUrl}
                alt="Aperçu de la photo à ajouter"
                className="w-full aspect-square object-cover rounded"
              />
            </div>
          )}

          <div>
            <label htmlFor="upload-alt" className="block text-argent-givre text-sm font-medium mb-1">
              Description (alt-text) <span className="text-rouge-rubis">*</span>
            </label>
            <p className="text-argent-doux/60 text-[11px] mb-2">
              Décris la photo pour les personnes qui n'y voient pas. Obligatoire.
            </p>
            <input
              id="upload-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              maxLength={200}
              required
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-argent-givre text-sm focus:outline-none focus:border-rose-metal/40"
              placeholder="Ex : French stiletto rose et blanc"
            />
            <p className="text-argent-doux/40 text-[10px] mt-1">{alt.length} / 200</p>
          </div>

          <div>
            <label htmlFor="upload-link" className="block text-argent-givre text-sm font-medium mb-1">
              Lien au clic (URL Instagram ou autre)
            </label>
            <input
              id="upload-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={500}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-argent-givre text-sm focus:outline-none focus:border-rose-metal/40"
              placeholder="https://..."
            />
          </div>

          <div>
            <p className="text-argent-doux/70 text-xs">
              Nom du fichier : <code className="text-argent-givre">{props.suggestedFilename}</code>
            </p>
          </div>

          {error && (
            <p className="text-rouge-rubis text-sm bg-rouge-sang/10 border border-rouge-rubis/30 rounded p-3">
              ❌ {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={props.onCancel}
            className="px-4 py-2 text-argent-doux text-xs tracking-widest uppercase border border-white/10 hover:border-white/20 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!compressedBlob || processing}
            className="px-4 py-2 bg-rouge-rubis text-argent-givre text-xs tracking-widest uppercase border border-rouge-rubis hover:bg-rouge-sang disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ajouter à la galerie
          </button>
        </div>
      </form>
    </div>
  );
}
