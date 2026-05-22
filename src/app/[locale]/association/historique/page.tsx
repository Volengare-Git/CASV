import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Historique — CASV Versoix" };

const TIMELINE = [
  {
    year: "1984",
    title: "La première course",
    text: "Le 14 juin, Jacques Belloir et ses amis du quartier Montfleury organisent la toute première course de caisses à savon sur la route de Montfleury. L'objectif : financer des activités de quartier. Le succès est immédiat.",
    highlight: true,
  },
  {
    year: "1985",
    title: "Premier Grand Prix officiel",
    text: "Le 9 juin se tient le premier «Grand Prix des Colombières», inscrit au Championnat Suisse. 66 pilotes participent à cette première édition officielle, posant les bases du format compétitif de l'événement.",
  },
  {
    year: "1996",
    title: "Fondation de l'association",
    text: "Le 12 novembre, l'Association des Caisses à Savon de Versoix est officiellement fondée avec une trentaine de membres et un comité de neuf personnes. Une étape clé pour professionnaliser l'organisation.",
    highlight: true,
  },
  {
    year: "1997",
    title: "Ouverture du local",
    text: "L'association obtient un local de travail dans les sous-sols de l'école de Montfleury en octobre. Depuis lors, l'atelier est ouvert chaque mardi soir pour la construction et la réparation des caisses.",
  },
  {
    year: "2001",
    title: "Indépendance totale",
    text: "L'association investit dans son propre système de chronométrage et de sonorisation locale, devenant totalement autonome dans l'organisation de l'événement.",
  },
  {
    year: "2002",
    title: "Déménagement du parcours",
    text: "Suite à des travaux ferroviaires, la course est déplacée sur la route supérieure de Saint-Loup. Un nouveau tracé pour de nouvelles aventures.",
  },
  {
    year: "2003",
    title: "Intégration à la Fête de la Jeunesse",
    text: "L'événement s'intègre à la «Fête de la Jeunesse», s'enrichissant d'animations diversifiées avec de nombreuses associations du quartier. La fête prend une nouvelle dimension conviviale.",
  },
  {
    year: "2004",
    title: "20ème anniversaire",
    text: "Célébration du 20ème anniversaire avec 55 pilotes au départ. Deux décennies de passion pour les caisses à savon à Versoix.",
    highlight: true,
  },
  {
    year: "2009",
    title: "25ème anniversaire",
    text: "Pour son 25ème anniversaire, l'événement réunit 70 pilotes. L'association compte désormais 18 associations partenaires pour la Fête de la Jeunesse.",
  },
  {
    year: "2014",
    title: "30ème anniversaire",
    text: "Trois décennies de Grand Prix de Versoix. La course est devenue un rendez-vous incontournable du calendrier familial genevois.",
    highlight: true,
  },
  {
    year: "2018",
    title: "Retour du beau temps",
    text: "Après quatre années consécutives de mauvaises conditions météorologiques, l'édition 2018 se tient enfin sous un beau soleil. Un millésime mémorable pour pilotes et spectateurs.",
  },
  {
    year: "2026",
    title: "41ème Grand Prix",
    text: "Le dimanche 3 mai 2026, la course reprend sur ses terres historiques de Versoix. Plus de 40 ans d'histoire, toujours la même passion.",
    highlight: true,
  },
];

export default function HistoriquePage() {
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
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-2">
            1984 — aujourd&apos;hui
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Historique
          </h1>
          <p className="text-lg text-gray-500">
            Quatre décennies de course, de passion et de convivialité à Versoix.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 sm:left-8" />

          <div className="space-y-10">
            {TIMELINE.map((entry, i) => (
              <div key={i} className="relative flex gap-6 sm:gap-8">
                {/* Year badge */}
                <div className="relative z-10 shrink-0">
                  <div
                    className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full text-xs sm:text-sm font-bold ring-4 ring-white ${
                      entry.highlight
                        ? "bg-blue-800 text-white"
                        : "bg-white text-gray-600 ring-gray-200 border border-gray-200"
                    }`}
                  >
                    {entry.year}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`flex-1 rounded-2xl p-5 sm:p-6 mb-2 ${
                    entry.highlight
                      ? "bg-blue-50 ring-1 ring-blue-100"
                      : "bg-gray-50 ring-1 ring-gray-100"
                  }`}
                >
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1.5">
                    {entry.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-8 text-center">
          <p className="text-base font-semibold text-gray-900 mb-1">
            Une correction ou un souvenir à partager ?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Aidez-nous à compléter cette chronique de l&apos;association.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
          >
            Nous écrire
          </Link>
        </div>
      </div>
    </div>
  );
}
