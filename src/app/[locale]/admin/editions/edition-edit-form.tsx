"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateEdition, type EditionFormData } from "./actions";

interface Props {
  edition: {
    id: string;
    year: number;
    name: string;
    event_date: string;
    registration_opens_at: string;
    registration_closes_at: string;
    max_pilots: number;
    price_chf: number;
  };
}

export default function EditionEditForm({ edition }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<EditionFormData>({
    year: edition.year,
    name: edition.name,
    event_date: edition.event_date,
    registration_opens_at: edition.registration_opens_at,
    registration_closes_at: edition.registration_closes_at,
    max_pilots: edition.max_pilots,
    price_chf: edition.price_chf,
  });

  function update(field: keyof EditionFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateEdition(edition.id, form);
        toast.success("Édition mise à jour");
        setOpen(false);
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Modifier
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Modifier l&apos;édition</h4>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date de la course</label>
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => update("event_date", e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ouverture inscriptions</label>
            <input
              type="date"
              value={form.registration_opens_at.slice(0, 10)}
              onChange={(e) => update("registration_opens_at", e.target.value + "T00:00:00+01:00")}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fermeture inscriptions</label>
            <input
              type="date"
              value={form.registration_closes_at.slice(0, 10)}
              onChange={(e) => update("registration_closes_at", e.target.value + "T23:59:00+02:00")}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pilotes max</label>
            <input
              type="number"
              value={form.max_pilots}
              onChange={(e) => update("max_pilots", parseInt(e.target.value))}
              required
              min={1}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix (CHF)</label>
            <input
              type="number"
              value={form.price_chf}
              onChange={(e) => update("price_chf", parseFloat(e.target.value))}
              required
              min={0}
              step={0.5}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={isPending} className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50 transition-colors">
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
