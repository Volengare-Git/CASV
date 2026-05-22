import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Le Comité — CASV Versoix" };

const BUREAU = [
  { name: "Pierre-Antoine Queloz", role: "Président", email: "president@casv.ch", initial: "PQ" },
  { name: "Sarah Genequand Miche", role: "Trésorière", email: "tresorier@casv.ch", initial: "SG" },
  { name: "Thierry Delémont", role: "Chronométrage", email: null, initial: "TD" },
  { name: "Claire Ioset", role: "Sponsors", email: null, initial: "CI" },
  { name: "Sonia Schricker Tranchellini", role: "Sponsors & coordinatrice bénévoles", email: null, initial: "ST" },
  { name: "Alain Schudel", role: "Site internet", email: null, initial: "AS" },
  { name: "Yanick Vuille", role: "Coordinateur inscriptions", email: null, initial: "YV" },
  { name: "Savino Storione", role: "Responsable buvette", email: null, initial: "SS" },
];

const MEMBRES = [
  "Nadia Meylan",
  "Perparim Ajeti",
  "Yvo Bongo",
  "Alain Ray",
];

const VERIFICATEURS = [
  "Anne-Lise Berger-Bapst",
  "Giovanna Cerboni",
];

const ROLE_COLORS: Record<string, string> = {
  "Président": "bg-blue-100 text-blue-800",
  "Trésorière": "bg-amber-100 text-amber-800",
  "Chronométrage": "bg-gray-100 text-gray-700",
  "Sponsors": "bg-pink-100 text-pink-800",
  "Sponsors & coordinatrice bénévoles": "bg-pink-100 text-pink-800",
  "Site internet": "bg-purple-100 text-purple-800",
  "Coordinateur inscriptions": "bg-green-100 text-green-800",
  "Responsable buvette": "bg-orange-100 text-orange-800",
};

export default function ComitePage() {
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
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 mb-2">
            Bénévoles depuis des années
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Le Comité
          </h1>
          <p className="text-lg text-gray-500">
            Un comité entièrement bénévole qui œuvre toute l&apos;année pour faire vivre le Grand-Prix de Versoix.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-16">

        {/* Bureau */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bureau</h2>
          <p className="text-sm text-gray-500 mb-8">
            Les membres du bureau assurent la direction opérationnelle de l&apos;association.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {BUREAU.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100 hover:ring-gray-200 hover:bg-white transition-all"
              >
                {/* Avatar */}
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-800 text-white text-sm font-bold">
                  {member.initial}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
                {/* Email */}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Membres ordinaires + vérificateurs */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Membres ordinaires</h2>
            <ul className="space-y-2.5">
              {MEMBRES.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <span className="text-sm text-gray-700">{name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Vérificateurs aux comptes
            </h2>
            <ul className="space-y-2.5">
              {VERIFICATEURS.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <span className="text-sm text-gray-700">{name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Open meetings banner */}
        <div className="rounded-2xl bg-blue-800 px-8 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Rejoignez-nous
              </p>
              <p className="text-lg font-bold">
                Les réunions de comité sont ouvertes à tous.
              </p>
              <p className="mt-1 text-sm text-blue-200">
                Vous avez une idée, une envie de vous impliquer ? Venez nous rencontrer à Montfleury.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
