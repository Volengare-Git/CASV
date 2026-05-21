import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { Category, PaymentStatus, VolunteerStatus } from "@/lib/supabase/types";
import CancelRegistrationButton from "./cancel-registration-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

type RegistrationWithEdition = {
  id: string;
  category: Category;
  vehicle_name: string;
  payment_status: PaymentStatus;
  dossard_number: number | null;
  created_at: string;
  editions: { name: string; event_date: string } | null;
};

type VolunteerRegWithPost = {
  id: string;
  status: VolunteerStatus;
  created_at: string;
  editions: { name: string } | null;
  volunteer_posts: { name: string; start_time: string; end_time: string } | null;
};

const CATEGORY_LABELS: Record<Category, string> = {
  hobby: "Hobby",
  sport: "Sport",
  libre: "Libre",
  adulte: "Adultes",
};

const STATUS_STYLES: Record<PaymentStatus, { label: string; class: string }> = {
  paid: { label: "Payé", class: "bg-green-100 text-green-800" },
  pending: { label: "En attente", class: "bg-amber-100 text-amber-800" },
  refunded: { label: "Remboursé", class: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulé", class: "bg-red-100 text-red-700" },
};

const VOLUNTEER_STATUS_STYLES: Record<VolunteerStatus, { label: string; class: string }> = {
  pending: { label: "En attente", class: "bg-amber-100 text-amber-800" },
  assigned: { label: "Poste assigné", class: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Confirmé", class: "bg-green-100 text-green-800" },
};

export default async function ComptePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/compte");
  }

  const [{ data: profile }, { data: registrationsRaw }, { data: volunteerRegsRaw }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, phone, city, role")
        .eq("id", user.id)
        .single(),
      supabase
        .from("registrations")
        .select("id, category, vehicle_name, payment_status, dossard_number, created_at, editions(name, event_date)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("volunteer_registrations")
        .select("id, status, created_at, editions(name), volunteer_posts!assigned_post_id(name, start_time, end_time)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const registrations = (registrationsRaw ?? []) as RegistrationWithEdition[];
  const volunteerRegs = (volunteerRegsRaw ?? []) as VolunteerRegWithPost[];

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user.email;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Mon compte
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Administration
          </Link>
        )}
      </div>

      {/* Personal info card */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Informations personnelles
        </h2>
        {profile ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoField label="Prénom" value={profile.first_name} />
            <InfoField label="Nom" value={profile.last_name} />
            {profile.phone && <InfoField label="Téléphone" value={profile.phone} />}
            {profile.city && <InfoField label="Localité" value={profile.city} />}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Profil non trouvé.</p>
        )}
      </section>

      {/* Pilot registrations */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Mes inscriptions pilote
          </h2>
          <Link
            href="/inscription"
            className="text-sm font-medium text-blue-800 hover:underline"
          >
            S'inscrire →
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">
              Vous n'avez pas encore d'inscription.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
            >
              S'inscrire maintenant
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Édition</Th>
                  <Th>Catégorie</Th>
                  <Th>Caisse</Th>
                  <Th>Statut</Th>
                  <Th>Dossard</Th>
                  <Th>&nbsp;</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map((reg) => {
                  const status = STATUS_STYLES[reg.payment_status];
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <Td>
                        <div className="font-medium text-gray-900">
                          {reg.editions?.name ?? "—"}
                        </div>
                        {reg.editions?.event_date && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(reg.editions.event_date).toLocaleDateString("fr-CH", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </Td>
                      <Td>{CATEGORY_LABELS[reg.category]}</Td>
                      <Td>{reg.vehicle_name}</Td>
                      <Td>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
                      </Td>
                      <Td>
                        {reg.dossard_number != null ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-white">
                            {reg.dossard_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">À définir</span>
                        )}
                      </Td>
                      <Td>
                        {(reg.payment_status === "pending" || reg.payment_status === "paid") && (
                          <CancelRegistrationButton
                            registrationId={reg.id}
                            editionName={reg.editions?.name ?? "cette édition"}
                          />
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Volunteer registrations */}
      {volunteerRegs.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Mes inscriptions bénévole
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Édition</Th>
                  <Th>Poste assigné</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {volunteerRegs.map((reg) => {
                  const vstatus = VOLUNTEER_STATUS_STYLES[reg.status];
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <Td>{reg.editions?.name ?? "—"}</Td>
                      <Td>
                        {reg.volunteer_posts ? (
                          <div>
                            <div className="font-medium text-gray-900">{reg.volunteer_posts.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {reg.volunteer_posts.start_time} – {reg.volunteer_posts.end_time}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">En cours d'attribution</span>
                        )}
                      </Td>
                      <Td>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${vstatus.class}`}>
                          {vstatus.label}
                        </span>
                      </Td>
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

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
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

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3 text-sm text-gray-700">
      {children}
    </td>
  );
}
