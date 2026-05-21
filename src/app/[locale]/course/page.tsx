import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  ShieldCheck,
  Ruler,
  AlertCircle,
  Trophy,
  MapPin,
  ExternalLink,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("course");
  return { title: t("title") };
}

export default function CoursePage() {
  const t = useTranslations("course");

  const schedule = [
    { time: "7h00", event: "Fermeture de la route" },
    { time: "9h00", event: "Remise des dossards" },
    { time: "9h30", event: "Briefing de sécurité (obligatoire)", highlight: true },
    { time: "10h00", event: "1ère manche" },
    { time: "12h00", event: "Restauration" },
    { time: "13h30", event: "2ème manche" },
    { time: "15h00", event: "3ème manche" },
    { time: "17h00", event: "Remise des prix", highlight: true },
  ];

  const equipment = [
    "Casque intégral homologué",
    "Pantalon long",
    "Pull à manches longues",
    "Chaussures fermées (pas de sandales)",
    "Gants",
    "Corde de remorquage de 2.5 mètres minimum",
  ];

  const dimensions = [
    "Longueur maximale : 200 cm",
    "Largeur maximale : 87 cm",
    "Garde au sol minimale : 6.5 cm",
    "Freins obligatoires (testés avant la course)",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <Badge className="mb-3 bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-50">
          42ème Grand-Prix de Versoix
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500">Dimanche 3 mai 2027 · Versoix, Genève</p>
      </div>

      <div className="space-y-12">
        {/* Programme */}
        <section id="programme">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-blue-800" />
            <h2 className="text-xl font-bold text-gray-900">{t("programTitle")}</h2>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {schedule.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 ${
                  item.highlight ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } ${i < schedule.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span
                  className={`min-w-[4rem] text-sm font-bold tabular-nums ${
                    item.highlight ? "text-blue-800" : "text-gray-400"
                  }`}
                >
                  {item.time}
                </span>
                <span
                  className={`text-sm ${
                    item.highlight ? "font-semibold text-blue-900" : "text-gray-700"
                  }`}
                >
                  {item.event}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Toutes les heures sont approximatives
          </p>
        </section>

        <Separator />

        {/* Règlement */}
        <section id="reglement">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-blue-800" />
            <h2 className="text-xl font-bold text-gray-900">{t("rulesTitle")}</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Équipement */}
            <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">{t("rulesEquipment")}</h3>
              <ul className="space-y-2">
                {equipment.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dimensions */}
            <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="h-4 w-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">{t("rulesDimensions")}</h3>
              </div>
              <ul className="space-y-2">
                {dimensions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Assurance */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-6 sm:col-span-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-900">{t("rulesInsurance")}</h3>
                  <p className="mt-1 text-sm text-amber-800">{t("rulesInsuranceText")}</p>
                </div>
              </div>
            </div>

            {/* Classement */}
            <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">{t("rulesScoring")}</h3>
              </div>
              <p className="text-sm text-gray-600">{t("rulesScoringText")}</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Accès */}
        <section id="acces">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-blue-800" />
            <h2 className="text-xl font-bold text-gray-900">{t("accessTitle")}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">En voiture</h3>
              <p className="text-sm text-gray-600">
                Sortie autoroute Versoix. Parking disponible à proximité du parcours.
                La route principale est fermée dès 7h00 — prévoyez l&apos;itinéraire bis.
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">En transports publics</h3>
              <p className="text-sm text-gray-600">
                Gare de Versoix (RER F depuis Genève ou Lausanne).
                Arrêt de bus à proximité du départ.
              </p>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=Versoix,+Genève"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-800 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voir sur Google Maps
          </a>
        </section>
      </div>
    </div>
  );
}
