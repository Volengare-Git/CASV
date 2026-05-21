import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InscriptionForm from "./inscription-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("inscription");
  return { title: t("title") };
}

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

export default async function InscriptionPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/inscription");

  const { data: edition } = await supabase
    .from("editions")
    .select("id, name, price_chf, max_pilots, is_registration_open, registration_opens_at, registration_closes_at")
    .eq("is_active", true)
    .single();

  if (!edition) {
    return <ClosedMessage title="Aucune édition active pour le moment." sub="Revenez bientôt." />;
  }

  // Check open/closed state (override + dates)
  const isOpen = computeIsOpen(edition);
  if (!isOpen) {
    return <ClosedMessage title="Les inscriptions sont fermées." />;
  }

  // Check quota using admin client to count precisely
  const admin = createAdminClient();
  const { count: activeCount } = await admin
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("edition_id", edition.id)
    .in("payment_status", ["paid", "pending"]);

  if ((activeCount ?? 0) >= edition.max_pilots) {
    return (
      <ClosedMessage
        title="Les inscriptions sont complètes."
        sub={`Le quota de ${edition.max_pilots} pilotes est atteint. Vous pouvez contacter l'organisation pour être mis sur liste d'attente.`}
      />
    );
  }

  // Check if user already registered for this edition
  const { data: existing } = await supabase
    .from("registrations")
    .select("vehicle_name, category")
    .eq("user_id", user.id)
    .eq("edition_id", edition.id)
    .single();

  if (existing) {
    return (
      <ClosedMessage
        title="Vous êtes déjà inscrit à cette édition."
        sub={`${existing.vehicle_name} · ${existing.category}`}
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, birth_date, address, postal_code, city")
    .eq("id", user.id)
    .single();

  return (
    <InscriptionForm
      editionId={edition.id}
      editionName={edition.name}
      priceChf={edition.price_chf}
      userId={user.id}
      userEmail={user.email ?? ""}
      profile={profile}
    />
  );
}

function ClosedMessage({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-semibold text-gray-900 mb-2">{title}</p>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
    </div>
  );
}
