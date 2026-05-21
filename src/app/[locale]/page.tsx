import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ChevronRight,
  Flag,
  Shield,
  Zap,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("heroEdition") };
}

function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-gray-950 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Red accent bar */}
      <div className="absolute left-0 top-0 h-1 w-full bg-red-600" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <Badge className="mb-5 bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/20">
            <Flag className="mr-1.5 h-3 w-3" />
            {t("registrationOpen")}
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("heroEdition")}
          </h1>

          <p className="mt-3 text-xl font-medium text-red-400">
            {t("heroSubtitle")}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-400" />
              <span className="text-sm">{t("heroDate")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-400" />
              <span className="text-sm">{t("heroTime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-400" />
              <span className="text-sm">Versoix, Genève</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscription">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8"
              >
                {t("heroCta")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/benevoles">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                {t("heroCtaVolunteer")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const t = useTranslations("home");

  const categories = [
    {
      key: "hobby",
      icon: Shield,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      iconColor: "text-blue-500",
    },
    {
      key: "sport",
      icon: Zap,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      iconColor: "text-amber-500",
    },
    {
      key: "libre",
      icon: Flag,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      iconColor: "text-purple-500",
    },
    {
      key: "adultes",
      icon: Trophy,
      color: "bg-red-50 text-red-600 border-red-100",
      iconColor: "text-red-500",
    },
  ] as const;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t("categoriesTitle")}
          </h2>
          <p className="mt-2 text-gray-500">{t("categoriesSubtitle")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ key, icon: Icon, color, iconColor }) => (
            <div
              key={key}
              className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${color}`}
            >
              <Icon className={`mb-3 h-6 w-6 ${iconColor}`} />
              <h3 className="font-bold text-lg">
                {t(key as "hobby")}
              </h3>
              <p className="mt-1 text-sm opacity-80">
                {t(`${key}Desc` as "hobbyDesc")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoSection() {
  const t = useTranslations("home");

  const stats = [
    {
      value: t("infoPrice"),
      label: t("infoPriceLabel"),
      note: t("infoPriceNote"),
    },
    {
      value: t("infoMax"),
      label: t("infoMaxLabel"),
      note: null,
    },
    {
      value: t("infoManches"),
      label: t("infomanchesLabel"),
      note: t("infoClassement"),
    },
  ];

  return (
    <section className="bg-gray-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("infoTitle")}
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 p-6 text-center ring-1 ring-white/10"
            >
              <p className="text-3xl font-extrabold text-red-400">
                {stat.value}
              </p>
              <p className="mt-1 font-medium text-white">{stat.label}</p>
              {stat.note && (
                <p className="mt-1 text-sm text-gray-400">{stat.note}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/course">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              Voir le programme complet
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t("aboutTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {t("aboutText")}
            </p>
            <div className="mt-6">
              <Link href="/association">
                <Button variant="outline">
                  {t("aboutCta")}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual element */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "80 pilotes", sub: "maximum par édition" },
              { icon: Trophy, label: "+ 40 éditions", sub: "depuis les années 80" },
              { icon: Calendar, label: "1 jour par an", sub: "1er dimanche de mai" },
              { icon: Flag, label: "4 catégories", sub: "pour tous les âges" },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="rounded-xl bg-gray-50 p-5 ring-1 ring-gray-100"
              >
                <Icon className="mb-2 h-5 w-5 text-red-600" />
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const t = useTranslations("home");

  return (
    <section className="bg-red-600 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold">{t("heroEdition")}</h2>
            <p className="text-red-100">{t("heroDate")}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/inscription">
              <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold">
                {t("heroCta")}
              </Button>
            </Link>
            <Link href="/benevoles">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                {t("heroCtaVolunteer")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <InfoSection />
      <AboutSection />
      <CtaSection />
    </>
  );
}
