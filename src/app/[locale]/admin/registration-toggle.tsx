"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setRegistrationOpen } from "./actions";

interface Props {
  editionId: string;
  /** null = auto, true = force open, false = force closed */
  currentValue: boolean | null;
  /** Computed effective state (after applying date logic + override) */
  isEffectivelyOpen: boolean;
  /** Whether quota is reached */
  quotaReached: boolean;
}

export default function RegistrationToggle({
  editionId,
  currentValue,
  isEffectivelyOpen,
  quotaReached,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    // If currently open → force close. If currently closed → force open.
    const newValue = isEffectivelyOpen ? false : true;
    startTransition(async () => {
      try {
        await setRegistrationOpen(editionId, newValue);
        toast.success(
          newValue ? "Inscriptions ouvertes" : "Inscriptions fermées"
        );
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  }

  function resetToAuto() {
    startTransition(async () => {
      try {
        await setRegistrationOpen(editionId, null);
        toast.success("Mode automatique rétabli");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <span
            className={`h-3 w-3 rounded-full flex-shrink-0 ${
              quotaReached
                ? "bg-red-500"
                : isEffectivelyOpen
                ? "bg-green-500 animate-pulse"
                : "bg-gray-400"
            }`}
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {quotaReached
                ? "Quota atteint — inscriptions fermées"
                : isEffectivelyOpen
                ? "Inscriptions ouvertes"
                : "Inscriptions fermées"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentValue === null
                ? "Mode automatique (basé sur les dates)"
                : currentValue
                ? "Forcé ouvert par l'administrateur"
                : "Forcé fermé par l'administrateur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentValue !== null && (
            <button
              onClick={resetToAuto}
              disabled={isPending}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Mode automatique
            </button>
          )}
          <button
            onClick={toggle}
            disabled={isPending || quotaReached}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              isEffectivelyOpen
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isPending
              ? "Mise à jour..."
              : isEffectivelyOpen
              ? "Fermer les inscriptions"
              : "Ouvrir les inscriptions"}
          </button>
        </div>
      </div>
    </div>
  );
}
