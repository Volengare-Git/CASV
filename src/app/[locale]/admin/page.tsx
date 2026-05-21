import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Administration — CASV" };

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name, max_pilots, event_date")
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

  const stats = [
    {
      label: "Inscrits",
      value: `${total} / ${maxPilots}`,
      sub: `${Math.round((total / maxPilots) * 100)}% de remplissage`,
      color: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
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
      sub: "Toutes éditions confondues",
      color: "bg-purple-50 text-purple-700",
      dot: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
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
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-red-300 hover:shadow-sm transition-all group"
    >
      <div className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-1">
        {title} →
      </div>
      <div className="text-sm text-gray-500">{desc}</div>
    </Link>
  );
}
