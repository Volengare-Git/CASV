"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { activateEdition } from "./actions";

interface Props {
  editionId: string;
  editionName: string;
  activeEditionName: string;
}

export default function ActivateEditionButton({
  editionId,
  editionName,
  activeEditionName,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    if (
      !confirm(
        `Activer "${editionName}" ?\n\nCela va désactiver "${activeEditionName}". Le site basculera immédiatement sur la nouvelle édition et les inscriptions suivront les règles définies pour "${editionName}".`
      )
    )
      return;

    startTransition(async () => {
      try {
        await activateEdition(editionId);
        toast.success(`"${editionName}" est maintenant l'édition active`);
      } catch {
        toast.error("Erreur lors de l'activation");
      }
    });
  }

  return (
    <button
      onClick={handleActivate}
      disabled={isPending}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Activation..." : "Activer"}
    </button>
  );
}
