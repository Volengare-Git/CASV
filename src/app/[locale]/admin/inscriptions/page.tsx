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
  profiles: { first_name: string; last_name: string; phone: string | null } | null;
  editions: { name: string; year: number } | null;
};

export default async function InscriptionsAdminPage() {
  const admin = createAdminClient();

  const { data: raw } = await admin
    .from("registrations")
    .select("id, category, vehicle_name, payment_status, payment_method, dossard_number, notes, created_at, profiles(first_name, last_name, phone), editions(name, year)")
    .order("created_at", { ascending: true });

  const registrations = (raw ?? []) as RegistrationRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscriptions pilotes</h1>
      <InscriptionsTable registrations={registrations} />
    </div>
  );
}
