"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import { uploadResult, deleteResult } from "./actions";
import type { EditionOption, ResultRow } from "./page";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getPublicUrl(filePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/race-results/${filePath}`;
}

export default function ResultsManager({
  editions,
  results,
}: {
  editions: EditionOption[];
  results: ResultRow[];
}) {
  const [selectedEditionId, setSelectedEditionId] = useState(editions[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await uploadResult(formData);
        toast.success("Résultats publiés");
        setLabel("");
        formRef.current?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
      }
    });
  }

  function handleDelete(id: string, filePath: string, fileLabel: string) {
    if (!confirm(`Supprimer "${fileLabel}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      try {
        await deleteResult(id, filePath);
        toast.success("Fichier supprimé");
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    });
  }

  // Group results by edition (only editions that have files)
  const byEdition = editions
    .map((e) => ({
      edition: e,
      files: results.filter((r) => r.edition_id === e.id),
    }))
    .filter((g) => g.files.length > 0);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Upload form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-5">
          Publier un fichier PDF
        </h2>
        <form ref={formRef} onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Édition *</label>
            <select
              name="editionId"
              value={selectedEditionId}
              onChange={(e) => setSelectedEditionId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Libellé{" "}
              <span className="text-gray-400 font-normal">(optionnel — nom du fichier par défaut)</span>
            </label>
            <input
              name="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex : Résultats officiels, Classement Hobby…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Fichier PDF *</label>
            <input
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1
                file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400">PDF uniquement · 10 Mo maximum</p>
          </div>

          <button
            type="submit"
            disabled={isPending || editions.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {isPending ? "Publication en cours…" : "Publier"}
          </button>
        </form>
      </div>

      {/* Files list grouped by edition */}
      {byEdition.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun résultat publié pour le moment.</p>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Fichiers publiés
          </h2>
          {byEdition.map(({ edition, files }) => (
            <div key={edition.id}>
              <p className="text-xs font-medium text-gray-500 mb-2">{edition.name}</p>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 flex-shrink-0 text-red-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {f.label}
                          </p>
                          <p className="text-xs text-gray-400">{f.file_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={getPublicUrl(f.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Voir
                        </a>
                        <button
                          onClick={() => handleDelete(f.id, f.file_path, f.label)}
                          disabled={isPending}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
