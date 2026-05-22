"use client";

import { useState, useTransition } from "react";
import { Wrench, ShieldCheck, ShieldOff, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { setMaintenanceMode, updateMaintenanceMessage } from "./actions";

interface Props {
  initialEnabled: boolean;
  initialMessage: string;
  initialUntil: string;
}

export default function MaintenanceManager({ initialEnabled, initialMessage, initialUntil }: Props) {
  const [enabled, setEnabled]        = useState(initialEnabled);
  const [message, setMessage]        = useState(initialMessage);
  const [until, setUntil]            = useState(initialUntil);
  const [saved, setSaved]            = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSaved(false);
    startTransition(async () => {
      await setMaintenanceMode(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleSaveMessage() {
    setSaved(false);
    startTransition(async () => {
      await updateMaintenanceMessage(message, until);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-8">
      {/* Status card */}
      <div className={`rounded-2xl p-6 ring-1 transition-colors ${
        enabled ? "bg-red-50 ring-red-200" : "bg-green-50 ring-green-200"
      }`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {enabled ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            <div>
              <p className={`text-base font-bold ${enabled ? "text-red-900" : "text-green-900"}`}>
                {enabled ? "Maintenance ACTIVE — site inaccessible au public" : "Site en ligne et accessible"}
              </p>
              <p className={`text-sm mt-0.5 ${enabled ? "text-red-700" : "text-green-700"}`}>
                {enabled
                  ? "Les visiteurs voient la page de maintenance à la place du site."
                  : "Le site fonctionne normalement. Aucune action requise."}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
              enabled
                ? "bg-green-700 text-white hover:bg-green-800"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {enabled ? (
              <><ShieldCheck className="h-4 w-4" />Remettre en ligne</>
            ) : (
              <><ShieldOff className="h-4 w-4" />Activer la maintenance</>
            )}
          </button>
        </div>
      </div>

      {/* Warning when active */}
      {enabled && (
        <div className="flex gap-3 rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Les routes <code className="bg-amber-100 px-1 rounded">/admin</code>,{" "}
            <code className="bg-amber-100 px-1 rounded">/login</code> et{" "}
            <code className="bg-amber-100 px-1 rounded">/auth</code> restent accessibles même en mode maintenance.
          </p>
        </div>
      )}

      {/* Message editor */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-6 space-y-5">
        <h2 className="text-base font-bold text-gray-900">Message affiché aux visiteurs</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message principal
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Le site est temporairement en maintenance..."
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{message.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Heure de retour estimée <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            type="text"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            maxLength={100}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: dimanche 3 mai à 18h00"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
              <CheckCircle className="h-4 w-4" />
              Enregistré
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={handleSaveMessage}
            disabled={isPending || !message.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            Enregistrer le message
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 overflow-hidden">
        <div className="bg-gray-900 px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Aperçu — page publique
          </p>
        </div>
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800">
            Maintenance en cours
          </span>
          <p className="text-sm text-gray-600 max-w-sm">
            {message || <span className="text-gray-400 italic">Aucun message</span>}
          </p>
          {until && (
            <p className="text-xs text-amber-700 font-medium">Retour prévu : {until}</p>
          )}
        </div>
      </div>
    </div>
  );
}
