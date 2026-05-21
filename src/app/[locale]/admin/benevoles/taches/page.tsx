import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import TachesManager from "./taches-manager";

export const metadata: Metadata = { title: "Tâches bénévoles — Admin CASV" };

export type VolunteerTask = {
  id: string;
  label: string;
  display_order: number;
  edition_id: string;
};

export default async function TachesAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name")
    .eq("is_active", true)
    .single();

  const { data: tasks } = await admin
    .from("volunteer_tasks")
    .select("id, label, display_order, edition_id")
    .eq("edition_id", edition?.id ?? "")
    .order("display_order");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tâches bénévoles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ces tâches apparaissent dans le formulaire d&apos;inscription bénévole.
          Édition active : <strong>{edition?.name ?? "—"}</strong>
        </p>
      </div>
      <TachesManager
        tasks={(tasks ?? []) as VolunteerTask[]}
        editionId={edition?.id ?? ""}
      />
    </div>
  );
}
