import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CheckCircle, AlertTriangle, Info } from "lucide-react";

export const metadata: Metadata = { title: "Construction — CASV Versoix" };

const SPECS_COMMUNE = [
  { label: "Longueur max", value: "200 cm" },
  { label: "Largeur max", value: "87 cm" },
  { label: "Garde au sol min", value: "6,5 cm" },
  { label: "Poids max (avec pilote)", value: "≈ 130 kg" },
  { label: "Poids max (à vide)", value: "70 kg" },
  { label: "Diamètre des roues", value: "300 mm" },
  { label: "Alésage roue", value: "Ø 15 mm / L 95 mm" },
  { label: "Largeur bande de roulement", value: "23 mm" },
];

const STEERING = [
  { label: "Direction", value: "Centrale — type fusée interdit" },
  { label: "Câble (section min)", value: "Ø 2,5 mm acier" },
  { label: "Volant (hauteur min)", value: "30 cm au-dessus du plancher" },
  { label: "Rayon de braquage", value: "5,5 – 6 m (max 7 m)" },
];

const SAFETY = [
  "Carrosserie en bois ou sagex (protection pilote obligatoire)",
  "2 anneaux de remorquage (avant + arrière), trou Ø 8 mm pour mousqueton",
  "Corde de remorquage : 2 – 2,5 m, nylon, couleur vive",
  "Siège réglable recommandé (pilotes en croissance)",
  "Freins testés avant chaque manche (blocage roues arrière)",
];

export default function ConstructionPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link
            href="/association"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Association
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-700 mb-2">
            Guide technique
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Construction
          </h1>
          <p className="text-lg text-gray-500">
            Dimensions, matériaux, freinage et direction — tout ce qu&apos;il faut savoir pour construire une caisse à savon homologuée.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-12">

        {/* Two categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Deux catégories</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Officielle */}
            <div className="rounded-2xl bg-blue-50 ring-1 ring-blue-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-blue-800 px-3 py-1 text-xs font-bold text-white">
                  Officielle
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Construction à partir d&apos;un <strong>kit officiel</strong> disponible au local. Les roues et certaines pièces mécaniques sont fournies par le kit pour garantir l&apos;équité entre les pilotes.
              </p>
              <ul className="space-y-2">
                {["Kit disponible au local de Montfleury", "Roues fournies par le kit", "Freinage : patins alu sur pneus pleins", "Max 2 pilotes par véhicule et par course"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Libre */}
            <div className="rounded-2xl bg-purple-50 ring-1 ring-purple-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-purple-700 px-3 py-1 text-xs font-bold text-white">
                  Libre
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Conception <strong>entièrement libre</strong> dans les limites des dimensions et des normes de sécurité. Place à la créativité — sous réserve de contrôle technique avant le départ.
              </p>
              <ul className="space-y-2">
                {["Design et matériaux libres", "Respecter les dimensions max", "Contrôle technique obligatoire le jour J", "Pneus gonflés autorisés (freinage adapté)"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Specs table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dimensions &amp; poids</h2>
          <div className="rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <div className="bg-gray-900 px-6 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Châssis — valeurs communes aux deux catégories
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {SPECS_COMMUNE.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steering */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Direction</h2>
          <div className="rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <div className="divide-y divide-gray-50">
              {STEERING.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité obligatoire</h2>
          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">
                Ces éléments sont vérifiés lors du contrôle technique. Un véhicule non conforme ne sera pas admis au départ.
              </p>
            </div>
            <ul className="space-y-2.5">
              {SAFETY.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Ballast note */}
        <div className="flex gap-4 rounded-2xl bg-blue-50 ring-1 ring-blue-100 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Lest autorisé</p>
            <p className="text-sm text-gray-600">
              Pour les jeunes pilotes, l&apos;ajout de lest est autorisé afin d&apos;atteindre le poids optimal — à condition de ne pas dégrader les performances de freinage.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-blue-800 px-8 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Besoin d&apos;aide pour construire ?
              </p>
              <p className="text-lg font-bold">
                Venez à l&apos;atelier de Montfleury.
              </p>
              <p className="mt-1 text-sm text-blue-200">
                Tous les mardis soirs de 20h à 22h. Pierre-Antoine vous guidera pas à pas.
              </p>
            </div>
            <Link
              href="/association/local"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              Infos sur le local
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
