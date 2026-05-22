import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, PaymentStatus, PaymentMethod } from "@/lib/supabase/types";
import InscriptionsTable from "./inscriptions-table";

export const metadata: Metadata = { title: "Inscriptions — Admin CASV" };

export type RegistrationRow = {
  id: string;
  category: Category;
  vehicle_name: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  dossard_number: number | null;
  notes: string | null;
  created_at: string;
  profiles: { first_name: string; last_name: string; phone: string | null; birth_date: string | null } | null;
  editions: { name: string; year: number } | null;
};

export type CategoryAgeRule = {
  value: string;
  min_age: number | null;
  max_age: number | null;
};

export default async function InscriptionsAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, event_date")
    .eq("is_active", true)
    .single();

  const { data: raw } = await admin
    .from("registrations")
    .select("id, category, vehicle_name, payment_status, payment_method, dossard_number, notes, created_at, profiles(first_name, last_name, phone, birth_date), editions(name, year)")
    .eq("edition_id", edition?.id ?? "")
    .order("created_at", { ascending: true });

  const { data: ageRules } = await admin
    .from("registration_categories")
    .select("value, min_age, max_age")
    .eq("edition_id", edition?.id ?? "");

  const registrations = (raw ?? []) as RegistrationRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscriptions pilotes</h1>
      <InscriptionsTable
        registrations={registrations}
        eventDateIso={edition?.event_date ?? ""}
        ageRules={(ageRules ?? []) as CategoryAgeRule[]}
      />
    </div>
  );
}
