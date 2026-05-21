import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import EditionCreateForm from "./edition-create-form";
import EditionEditForm from "./edition-edit-form";
import ActivateEditionButton from "./activate-edition-button";

export const metadata: Metadata = { title: "Éditions — Admin CASV" };

function computeIsOpen(edition: {
  is_registration_open: boolean | null;
  registration_opens_at: string;
  registration_closes_at: string;
}): boolean {
  if (edition.is_registration_open === true) return true;
  if (edition.is_registration_open === false) return false;
  const now = new Date();
  return (
    now >= new Date(edition.registration_opens_at) &&
    now <= new Date(edition.registration_closes_at)
  );
}

export default async function EditionsPage() {
  const admin = createAdminClient();

  // Fetch all editions ordered by year desc
  const { data: editions } = await admin
    .from("editions")
    .select("id, year, name, event_date, max_pilots, price_chf, is_active, is_registration_open, registration_opens_at, registration_closes_at")
    .order("year", { ascending: false });

  // Fetch registration counts per edition
  const { data: regCounts } = await admin
    .from("registrations")
    .select("edition_id, payment_status");

  // Fetch volunteer counts per edition
  const { data: volCounts } = await admin
    .from("volunteer_registrations")
    .select("edition_id");

  const countsByEdition = (editionId: string) => {
    const regs = regCounts?.filter((r) => r.edition_id === editionId) ?? [];
    return {
      total: regs.length,
      paid: regs.filter((r) => r.payment_status === "paid").length,
      pending: regs.filter((r) => r.payment_status === "pending").length,
      volunteers: volCounts?.filter((v) => v.edition_id === editionId).length ?? 0,
    };
  };

  const activeEdition = editions?.find((e) => e.is_active);
  const otherEditions = editions?.filter((e) => !e.is_active) ?? [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des éditions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez et gérez les éditions du Grand-Prix de Versoix
          </p>
        </div>
        {activeEdition && (
          <EditionCreateForm
            currentYear={activeEdition.year}
            currentName={activeEdition.name}
            currentMaxPilots={activeEdition.max_pilots}
            currentPriceChf={activeEdition.price_chf}
          />
        )}
      </div>

      {/* Active edition */}
      {activeEdition ? (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Édition active
          </h2>
          <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Active</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{activeEdition.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(activeEdition.event_date).toLocaleDateString("fr-CH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <EditionEditForm edition={activeEdition} />
            </div>

            {/* Stats grid */}
            <ActiveEditionStats edition={activeEdition} counts={countsByEdition(activeEdition.id)} />
          </div>
        </section>
      ) : (
        <div className="mb-8 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">Aucune édition active.</p>
        </div>
      )}

      {/* Other editions */}
      {otherEditions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Autres éditions
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Édition</Th>
                  <Th>Date</Th>
                  <Th>Inscrits</Th>
                  <Th>Bénévoles</Th>
                  <Th>Prix</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {otherEditions.map((edition) => {
                  const c = countsByEdition(edition.id);
                  return (
                    <tr key={edition.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{edition.name}</div>
                        <div className="text-xs text-gray-400">{edition.year}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(edition.event_date).toLocaleDateString("fr-CH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {c.total} / {edition.max_pilots}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.volunteers}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{edition.price_chf} CHF</td>
                      <td className="px-4 py-3">
                        {activeEdition && (
                          <ActivateEditionButton
                            editionId={edition.id}
                            editionName={edition.name}
                            activeEditionName={activeEdition.name}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function ActiveEditionStats({
  edition,
  counts,
}: {
  edition: {
    id: string;
    max_pilots: number;
    price_chf: number;
    is_registration_open: boolean | null;
    registration_opens_at: string;
    registration_closes_at: string;
  };
  counts: { total: number; paid: number; pending: number; volunteers: number };
}) {
  const isOpen = computeIsOpen(edition) && counts.total < edition.max_pilots;
  const fillPct = Math.min(Math.round((counts.total / edition.max_pilots) * 100), 100);
  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Inscrits" value={`${counts.total} / ${edition.max_pilots}`} />
        <StatBox label="Payés" value={counts.paid.toString()} />
        <StatBox label="En attente" value={counts.pending.toString()} />
        <StatBox label="Bénévoles" value={counts.volunteers.toString()} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoItem label="Prix" value={`${edition.price_chf} CHF`} />
        <InfoItem label="Inscriptions" value={isOpen ? "Ouvertes" : "Fermées"} highlight={isOpen} />
        <InfoItem label="Ouverture" value={new Date(edition.registration_opens_at).toLocaleDateString("fr-CH")} />
        <InfoItem label="Fermeture" value={new Date(edition.registration_closes_at).toLocaleDateString("fr-CH")} />
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Remplissage</span>
          <span>{fillPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${fillPct >= 100 ? "bg-red-500" : fillPct >= 80 ? "bg-amber-500" : "bg-blue-600"}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3 text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${highlight ? "text-green-600" : "text-gray-700"}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {children}
    </th>
  );
}
