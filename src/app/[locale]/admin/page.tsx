import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeIsOpen } from "@/lib/utils";
import RegistrationToggle from "./registration-toggle";

export const metadata: Metadata = { title: "Administration — CASV" };

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name, max_pilots, event_date, is_registration_open, registration_opens_at, registration_closes_at")
    .eq("is_active", true)
    .single();

  const [{ data: regs }, { count: volunteerCount }] = await Promise.all([
    admin
      .from("registrations")
      .select("payment_status")
      .eq("edition_id", edition?.id ?? ""),
    admin
      .from("volunteer_registrations")
      .select("*", { count: "exact", head: true })
      .eq("edition_id", edition?.id ?? ""),
  ]);

  const total = regs?.length ?? 0;
  const paid = regs?.filter((r) => r.payment_status === "paid").length ?? 0;
  const pending = regs?.filter((r) => r.payment_status === "pending").length ?? 0;
  const maxPilots = edition?.max_pilots ?? 80;
  const quotaReached = total >= maxPilots;

  const isEffectivelyOpen = edition
    ? computeIsOpen(edition) && !quotaReached
    : false;

  const fillPercent = Math.min(Math.round((total / maxPilots) * 100), 100);

  const stats = [
    {
      label: "Inscrits",
      value: `${total} / ${maxPilots}`,
      sub: `${fillPercent}% de remplissage`,
      color: quotaReached ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700",
      dot: quotaReached ? "bg-red-500" : "bg-blue-500",
    },
    {
      label: "Paiements confirmés",
      value: paid.toString(),
      sub: total > 0 ? `${Math.round((paid / total) * 100)}% des inscrits` : "—",
      color: "bg-green-50 text-green-700",
      dot: "bg-green-500",
    },
    {
      label: "En attente de paiement",
      value: pending.toString(),
      sub: pending === 0 ? "Tout est à jour ✓" : "À valider manuellement",
      color: pending > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-600",
      dot: pending > 0 ? "bg-amber-500" : "bg-gray-400",
    },
    {
      label: "Bénévoles inscrits",
      value: (volunteerCount ?? 0).toString(),
      sub: "Pour cette édition",
      color: "bg-purple-50 text-purple-700",
      dot: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        {edition && (
          <p className="mt-1 text-sm text-gray-500">
            {edition.name} &middot;{" "}
            {new Date(edition.event_date).toLocaleDateString("fr-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Registration toggle */}
      {edition && (
        <RegistrationToggle
          editionId={edition.id}
          currentValue={edition.is_registration_open}
          isEffectivelyOpen={isEffectivelyOpen}
          quotaReached={quotaReached}
        />
      )}

      {/* Quota progress bar */}
      {edition && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Remplissage
            </span>
            <span className="text-xs font-bold text-gray-700">
              {total} / {maxPilots} pilotes
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaReached ? "bg-red-500" : fillPercent >= 80 ? "bg-amber-500" : "bg-blue-600"
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          {quotaReached && (
            <p className="mt-2 text-xs text-red-600 font-medium">
              Quota atteint — les inscriptions sont automatiquement fermées.
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                {s.label}
              </span>
            </div>
            <div className="text-3xl font-bold mt-2 mb-1">{s.value}</div>
            <div className="text-xs opacity-70">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink
          href="/admin/inscriptions"
          title="Gérer les inscriptions"
          desc="Valider les paiements, attribuer les dossards, exporter CSV"
        />
        <QuickLink
          href="/admin/benevoles"
          title="Gérer les bénévoles"
          desc="Consulter les inscriptions et assigner les postes"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <div className="font-semibold text-gray-900 group-hover:text-blue-800 transition-colors mb-1">
        {title} →
      </div>
      <div className="text-sm text-gray-500">{desc}</div>
    </Link>
  );
}
