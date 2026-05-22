import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ResultsManager from "./results-manager";

export const metadata: Metadata = { title: "Résultats — Admin CASV" };

export type EditionOption = { id: string; name: string; year: number };
export type ResultRow = {
  id: string;
  edition_id: string;
  label: string;
  file_path: string;
  file_name: string;
  created_at: string;
};

export default async function ResultatsAdminPage() {
  const admin = createAdminClient();

  const [{ data: editions }, { data: results }] = await Promise.all([
    admin
      .from("editions")
      .select("id, name, year")
      .order("year", { ascending: false }),
    admin
      .from("race_results")
      .select("id, edition_id, label, file_path, file_name, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Résultats de course</h1>
      <ResultsManager
        editions={(editions ?? []) as EditionOption[]}
        results={(results ?? []) as ResultRow[]}
      />
    </div>
  );
}
