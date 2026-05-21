"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createEdition, type EditionFormData } from "./actions";
import { firstSundayOfMay } from "./utils";

function buildDefaults(baseYear: number, baseName: string, maxPilots: number, priceCHF: number): EditionFormData {
  const nextYear = baseYear + 1;
  const eventDate = firstSundayOfMay(nextYear);
  // Registration opens Jan 1, closes 3 weeks before event
  const closeDate = new Date(eventDate);
  closeDate.setDate(closeDate.getDate() - 21);
  // Extract edition number from name and increment (e.g. "42ème" → 43)
  const match = baseName.match(/^(\d+)/);
  const nextNum = match ? parseInt(match[1]) + 1 : nextYear - 1985;
  const suffix = nextNum === 1 ? "er" : "ème";

  return {
    year: nextYear,
    name: `${nextNum}${suffix} Grand-Prix de Versoix`,
    event_date: eventDate,
    registration_opens_at: `${nextYear}-01-01T00:00:00+01:00`,
    registration_closes_at: closeDate.toISOString().slice(0, 10) + "T23:59:00+02:00",
    max_pilots: maxPilots,
    price_chf: priceCHF,
  };
}

interface Props {
  currentYear: number;
  currentName: string;
  currentMaxPilots: number;
  currentPriceChf: number;
}

export default function EditionCreateForm({
  currentYear,
  currentName,
  currentMaxPilots,
  currentPriceChf,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<EditionFormData>(() =>
    buildDefaults(currentYear, currentName, currentMaxPilots, currentPriceChf)
  );

  function update(field: keyof EditionFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createEdition(form);
        toast.success(`Édition ${form.year} créée avec succès`);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
      >
        <span className="text-lg leading-none">+</span>
        Créer l&apos;édition {currentYear + 1}
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-lg">Nouvelle édition {form.year}</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom de l&apos;édition</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Année</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", parseInt(e.target.value))}
              required
              min={2020}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
          <p className="text-xs text-gray-400">
            1er dimanche de mai {form.year} calculé automatiquement — modifiable si besoin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ouverture des inscriptions</label>
            <input
              type="date"
              value={form.registration_opens_at.slice(0, 10)}
              onChange={(e) => update("registration_opens_at", e.target.value + "T00:00:00+01:00")}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fermeture des inscriptions</label>
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
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pilotes maximum</label>
            <input
              type="number"
              value={form.max_pilots}
              onChange={(e) => update("max_pilots", parseInt(e.target.value))}
              required
              min={1}
              max={200}
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

        <div className="rounded-lg bg-blue-100 px-4 py-3 text-xs text-blue-800">
          Les postes bénévoles de l&apos;édition active seront automatiquement copiés dans cette nouvelle édition.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Création..." : "Créer l'édition"}
          </button>
        </div>
      </form>
    </div>
  );
}
