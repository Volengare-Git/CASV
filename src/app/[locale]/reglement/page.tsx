import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ShieldCheck,
  Trophy,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  Ban,
  Camera,
  Hash,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = { title: "Règlement — CASV Versoix" };

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    id: "hobby-cadet",
    label: "Hobby Cadet",
    color: "bg-blue-50 ring-blue-100",
    badge: "bg-blue-800 text-white",
    dot: "bg-blue-800",
    tires: "Pneus pleins (kit)",
    years: "Nés 2015 – 2019",
    age: "7 – 11 ans en 2026",
  },
  {
    id: "hobby-junior",
    label: "Hobby Junior",
    color: "bg-blue-50 ring-blue-100",
    badge: "bg-blue-600 text-white",
    dot: "bg-blue-600",
    tires: "Pneus pleins (kit)",
    years: "Nés 2010 – 2014",
    age: "12 – 16 ans en 2026",
  },
  {
    id: "sport-cadet",
    label: "Sport Cadet",
    color: "bg-purple-50 ring-purple-100",
    badge: "bg-purple-800 text-white",
    dot: "bg-purple-800",
    tires: "Pneus gonflés",
    years: "Nés 2015 – 2019",
    age: "7 – 11 ans en 2026",
  },
  {
    id: "sport-junior",
    label: "Sport Junior",
    color: "bg-purple-50 ring-purple-100",
    badge: "bg-purple-600 text-white",
    dot: "bg-purple-600",
    tires: "Pneus gonflés",
    years: "Nés 2010 – 2014",
    age: "12 – 16 ans en 2026",
  },
  {
    id: "libre",
    label: "Libre",
    color: "bg-green-50 ring-green-100",
    badge: "bg-green-700 text-white",
    dot: "bg-green-700",
    tires: "Pneus libres",
    years: "Nés 2010 – 2019",
    age: "7 – 16 ans en 2026",
  },
  {
    id: "plus16",
    label: "+16 ans",
    color: "bg-amber-50 ring-amber-100",
    badge: "bg-amber-700 text-white",
    dot: "bg-amber-700",
    tires: "Pneus libres",
    years: "Nés 2009 et avant",
    age: "17 ans et plus en 2026",
  },
];

const PILOT_EQUIPMENT = [
  "Casque intégral homologué (obligatoire, non-négociable)",
  "Pantalon long",
  "Pull ou veste à manches longues",
  "Chaussures fermées — sandales et tongs interdites",
  "Gants",
  "Corde de remorquage d'au moins 2,5 m avec deux mousquetons aux extrémités",
];

const RACE_RULES = [
  {
    icon: Hash,
    title: "Numéro de véhicule",
    text: "Le numéro fourni par l'organisateur doit être apposé à l'avant du véhicule. Seul l'autocollant officiel est autorisé.",
  },
  {
    icon: Trophy,
    title: "Classement",
    text: "Le classement est établi sur les 2 meilleurs temps parmi les 3 manches. En cas d'égalité, le 3e temps est utilisé comme départage.",
  },
  {
    icon: Camera,
    title: "Droits à l'image",
    text: "En s'inscrivant, chaque pilote (ou son représentant légal) autorise l'association CASV à utiliser photos et vidéos prises lors de l'événement à des fins de communication.",
  },
  {
    icon: Ban,
    title: "Alcool interdit",
    text: "La consommation d'alcool est strictement interdite pour tous les pilotes, sans exception d'âge, depuis le briefing jusqu'à la fin de la remise des prix.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function ReglementPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link
            href="/course"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            La Course
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 mb-2">
            Édition 2026
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Règlement
          </h1>
          <p className="text-lg text-gray-500">
            Catégories, équipement, inscription et règles de course — tout ce qu&apos;il faut savoir pour participer au Grand-Prix de Versoix.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-16">

        {/* ── 1. Catégories ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Six catégories selon l&apos;âge et le type de pneus pour l&apos;édition 2026.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-2xl p-5 ring-1 ${cat.color}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cat.badge}`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{cat.years}</p>
                <p className="text-xs text-gray-500 mb-3">{cat.age}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${cat.dot}`} />
                  <span className="text-xs text-gray-600">{cat.tires}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Les années de naissance se décalent d&apos;un an à chaque édition. En 2027, la catégorie Cadet sera ouverte aux nés 2016 – 2020, etc.
            </p>
          </div>
        </section>

        {/* ── 2. Participants & Locations ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Participants &amp; Locations</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Nombre de places</p>
              <p className="text-3xl font-extrabold text-blue-800 mb-1">80 <span className="text-base font-semibold text-gray-500">pilotes max</span></p>
              <p className="text-sm text-gray-600">Âge minimum : 7 ans révolus le jour de la course.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Location de véhicule</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Un nombre limité de caisses à savon est disponible à la location. Contactez les organisateurs dès l&apos;ouverture des inscriptions — les demandes sont traitées par ordre d&apos;arrivée.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. Pneus ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Pneus</h2>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gray-900 px-6 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Règles applicables depuis 2006
              </p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Les pneus gonflés sont <strong>tolérés depuis 2006</strong> pour les catégories Sport et Libre, à condition d&apos;utiliser le type de roue homologué pour la compétition. Les pneus pleins du kit restent obligatoires pour les catégories Hobby.
              </p>
              <div className="flex gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-100 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-900">Attention par temps chaud ou mouillé</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Par temps humide, la distance de freinage avec des pneus gonflés est significativement allongée. Par temps chaud, la dilatation de l&apos;air peut provoquer un sous-gonflage apparent — vérifiez la pression avant chaque manche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Freins ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Freins</h2>
          </div>

          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">
                Freins obligatoires — vérifiés avant chaque manche
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Le système de freinage doit être en parfait état de fonctionnement. Le test de validation est le suivant :
            </p>
            <div className="rounded-xl bg-white ring-1 ring-amber-100 p-4">
              <p className="text-sm font-semibold text-gray-800 mb-1">Test du commissaire</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pilote aux commandes, freins serrés — un adulte pousse le véhicule dans le sens de la marche. Le véhicule doit rester <strong>complètement immobile</strong>. Tout glissement entraîne le refus au départ.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Équipement du pilote ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Équipement du pilote</h2>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {PILOT_EQUIPMENT.map((item, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex gap-3 rounded-2xl bg-blue-50 ring-1 ring-blue-100 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs text-gray-600 leading-relaxed">
              L&apos;équipement est vérifié au contrôle technique. Tout pilote non conforme sera refusé au départ sans remboursement.
            </p>
          </div>
        </section>

        {/* ── 6. Risques & Responsabilités ──────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Risques, responsabilités &amp; assurances</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Acceptation des risques</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                La participation à la course implique l&apos;acceptation des risques inhérents à la pratique des sports mécaniques non motorisés. L&apos;organisateur décline toute responsabilité en cas d&apos;accident, blessure ou dommage matériel survenant lors de l&apos;événement.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Assurance</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chaque participant est responsable de sa propre couverture d&apos;assurance (accidents, responsabilité civile). L&apos;association CASV Versoix dispose d&apos;une assurance organisateur pour l&apos;événement, qui ne se substitue pas à l&apos;assurance personnelle des participants.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">Participants mineurs</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Pour tout participant mineur, le représentant légal (père, mère ou tuteur) doit valider personnellement la décharge de responsabilité lors de l&apos;inscription. Cette validation est obligatoire — aucun pilote mineur ne sera admis sans décharge signée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Inscription & Paiement ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Inscription &amp; Paiement</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dates */}
            <div className="rounded-2xl bg-blue-50 ring-1 ring-blue-100 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Dates 2026</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ouverture</span>
                  <span className="text-sm font-bold text-gray-900">Dim. 5 avril 2026</span>
                </div>
                <div className="h-px bg-blue-100" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Clôture</span>
                  <span className="text-sm font-bold text-gray-900">Lun. 27 avril 2026</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Les places étant limitées à 80, l&apos;inscription est close dès que le maximum est atteint, même avant la date de clôture.
              </p>
            </div>

            {/* Tarif */}
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Frais d&apos;inscription</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">
                25 <span className="text-base font-semibold text-gray-500">CHF</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">Inclut boisson de bienvenue + repas de midi</p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />
                  <span>Annulation ≥ 1 semaine avant la course : remboursement de CHF 10</span>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                  <span>Annulation tardive ou absence : aucun remboursement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="mt-4 rounded-2xl bg-white ring-1 ring-gray-100 p-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">Paiement par virement bancaire</p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <code className="text-sm font-mono font-semibold text-gray-900 tracking-wider select-all">
                CH85 8080 8009 4372 6961 2
              </code>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Indiquez le nom du pilote et la catégorie en référence du virement. Le paiement doit être reçu avant la clôture des inscriptions.
            </p>
          </div>
        </section>

        {/* ── 8. Règles de course ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-5 w-5 text-blue-800" />
            <h2 className="text-2xl font-bold text-gray-900">Règles de course</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {RACE_RULES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-blue-800 px-8 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Prêt à participer ?
              </p>
              <p className="text-lg font-bold">
                Inscrivez-vous avant le 27 avril 2026.
              </p>
              <p className="mt-1 text-sm text-blue-200">
                80 places disponibles · CHF 25 · repas inclus
              </p>
            </div>
            <Link
              href="/inscription"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              S&apos;inscrire maintenant
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Construction link */}
        <div className="text-center pb-4">
          <p className="text-sm text-gray-500 mb-3">
            Vous construisez votre caisse à savon ? Consultez les spécifications techniques.
          </p>
          <Link
            href="/association/construction"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Guide de construction
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
