import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Clock, Users, Wrench, BookOpen, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("association");
  return { title: t("title") };
}

const SECTIONS = [
  {
    href: "/association/historique" as const,
    icon: Clock,
    color: "bg-amber-50 text-amber-700 ring-amber-100",
    iconBg: "bg-amber-100",
    title: "Historique",
    description: "Depuis la première course en 1984 organisée à Montfleury jusqu'aux 40+ éditions d'aujourd'hui — retracez l'histoire du Grand-Prix de Versoix.",
    cta: "Voir l'historique",
  },
  {
    href: "/association/comite" as const,
    icon: Users,
    color: "bg-blue-50 text-blue-700 ring-blue-100",
    iconBg: "bg-blue-100",
    title: "Le Comité",
    description: "Bureau, membres ordinaires et vérificateurs aux comptes. Les réunions de comité sont ouvertes à toutes les personnes intéressées.",
    cta: "Voir le comité",
  },
  {
    href: "/association/local" as const,
    icon: Wrench,
    color: "bg-green-50 text-green-700 ring-green-100",
    iconBg: "bg-green-100",
    title: "Notre Local",
    description: "Atelier équipé au parking Montfleury, ouvert tous les mardis soirs. Idéal pour construire ou réparer votre caisse à savon.",
    cta: "Infos pratiques",
  },
  {
    href: "/association/construction" as const,
    icon: BookOpen,
    color: "bg-purple-50 text-purple-700 ring-purple-100",
    iconBg: "bg-purple-100",
    title: "Construction",
    description: "Deux catégories (Officielle et Libre), dimensions réglementaires, matériaux, systèmes de freinage et de direction.",
    cta: "Voir les specs",
  },
];

export default async function AssociationPage() {
  const t = await getTranslations("association");

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Depuis 1984 · Versoix, Genève
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Section cards */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {SECTIONS.map(({ href, icon: Icon, color, iconBg, title, description, cta }) => (
            <Link
              key={href}
              href={href}
              className={`group relative rounded-2xl p-8 ring-1 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${color}`}
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">{description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:gap-2.5 transition-all">
                {cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-12 rounded-2xl bg-blue-800 px-8 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Une idée ? Une question ?
              </p>
              <p className="text-lg font-bold">
                Les réunions de comité sont ouvertes à tous.
              </p>
              <p className="mt-1 text-sm text-blue-200">
                Chaque mois à Montfleury — contactez-nous pour connaître la prochaine date.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
