import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InscriptionForm from "./inscription-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("inscription");
  return { title: t("title") };
}

export default async function InscriptionPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/inscription");

  const { data: edition } = await supabase
    .from("editions")
    .select("id, name, price_chf, registration_opens_at, registration_closes_at")
    .eq("is_active", true)
    .single();

  if (!edition) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-semibold text-gray-900 mb-2">Aucune édition active pour le moment.</p>
        <p className="text-sm text-gray-500">Revenez bientôt.</p>
      </div>
    );
  }

  const now = new Date();
  if (now < new Date(edition.registration_opens_at)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-semibold text-gray-900 mb-2">Les inscriptions ne sont pas encore ouvertes.</p>
        <p className="text-sm text-gray-500">
          Ouverture le {new Date(edition.registration_opens_at).toLocaleDateString("fr-CH")}.
        </p>
      </div>
    );
  }

  if (now > new Date(edition.registration_closes_at)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-semibold text-gray-900 mb-2">Les inscriptions sont fermées.</p>
      </div>
    );
  }

  const { data: existing } = await supabase
    .from("registrations")
    .select("vehicle_name, category")
    .eq("user_id", user.id)
    .eq("edition_id", edition.id)
    .single();

  if (existing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-semibold text-gray-900 mb-2">Vous êtes déjà inscrit à cette édition.</p>
        <p className="text-sm text-gray-500 capitalize">{existing.vehicle_name} · {existing.category}</p>
      </div>
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
