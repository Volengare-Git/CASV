import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowLeft, MapPin, Clock, Wrench, Mail, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Notre Local — CASV Versoix" };

const MACHINES = [
  "Scie circulaire (métal)",
  "Scie à ruban (bois)",
  "Ponceuse",
  "Perceuse à colonne",
  "Établis et outillage général",
];

export default function LocalPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link
            href="/association"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Association
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700 mb-2">
            Ouvert depuis octobre 1997
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Notre Local
          </h1>
          <p className="text-lg text-gray-500">
            Un atelier équipé au cœur du quartier Montfleury, disponible chaque mardi soir pour construire ou réparer votre caisse à savon.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-8">

        {/* Info cards row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Adresse */}
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <MapPin className="h-5 w-5 text-blue-700" />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">Adresse</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Parking souterrain Montfleury<br />
              Versoix (12 km de Genève)<br />
              <span className="text-xs text-gray-400 mt-1 block">Entrée gauche → porte du fond</span>
            </p>
          </div>

          {/* Horaires */}
          <div className="rounded-2xl bg-green-50 ring-1 ring-green-100 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Clock className="h-5 w-5 text-green-700" />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">Horaires</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Tous les mardis</strong><br />
              20h00 — 22h00<br />
              <span className="text-xs text-gray-400 mt-1 block">Fermé pendant les vacances scolaires</span>
            </p>
          </div>

          {/* Tarif */}
          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Wrench className="h-5 w-5 text-amber-700" />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">Cotisation</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="text-2xl font-extrabold text-amber-700">50</span>
              <span className="text-sm font-semibold text-amber-700"> CHF</span><br />
              <span className="text-xs text-gray-500">par année · famille bienvenue</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Construisez votre caisse à savon
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Depuis octobre 1997, l&apos;atelier de Montfleury accueille pilotes et familles pour la construction et l&apos;entretien des caisses. Pierre-Antoine Queloz vous accompagne sur place pour vous guider dans vos réalisations.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Des kits de construction officiels sont disponibles à l&apos;achat directement au local. Nous recommandons de commencer au minimum <strong>6 mois avant la course</strong> (avril/mai) pour avoir le temps de construire dans de bonnes conditions.
          </p>
        </div>

        {/* Machines */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Équipement disponible</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {MACHINES.map((machine, i) => (
              <li key={i} className="flex items-center gap-3 px-6 py-3.5">
                <ChevronRight className="h-4 w-4 shrink-0 text-green-600" />
                <span className="text-sm text-gray-700">{machine}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-blue-800 px-8 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Besoin d&apos;un accès anticipé ?
              </p>
              <p className="text-lg font-bold">
                Contactez Pierre-Antoine Queloz
              </p>
              <p className="mt-1 text-sm text-blue-200">
                Il peut vous accueillir en dehors des heures habituelles sur arrangement préalable.
              </p>
            </div>
            <a
              href="mailto:technique@casv.ch"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              technique@casv.ch
            </a>
          </div>
        </div>

        {/* Construction link */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">
            Prêt à construire ? Consultez notre guide de construction.
          </p>
          <Link
            href="/association/construction"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Guide de construction
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
