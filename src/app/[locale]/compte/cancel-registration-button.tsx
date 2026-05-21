"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cancelOwnRegistration } from "./actions";

export default function CancelRegistrationButton({
  registrationId,
  editionName,
}: {
  registrationId: string;
  editionName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (
      !confirm(
        `Annuler votre inscription à "${editionName}" ?\n\nCette action est irréversible. Pour un éventuel remboursement, contactez l'organisation.`
      )
    )
      return;

    startTransition(async () => {
      try {
        await cancelOwnRegistration(registrationId);
        toast.success("Inscription annulée");
      } catch {
        toast.error("Erreur lors de l'annulation");
      }
    });
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition-colors"
    >
      {isPending ? "Annulation..." : "Annuler l'inscription"}
    </button>
  );
}
