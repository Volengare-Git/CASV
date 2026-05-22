import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import CategoriesManager from "./categories-manager";

export const metadata: Metadata = { title: "Catégories — Admin CASV" };

export type CategoryRow = {
  id: string;
  value: string;
  label: string;
  description: string;
  display_order: number;
  is_active: boolean;
  min_age: number | null;
  max_age: number | null;
};

export default async function CategoriesPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name")
    .eq("is_active", true)
    .single();

  const { data: categories } = await admin
    .from("registration_categories")
    .select("id, value, label, description, display_order, is_active, min_age, max_age")
    .eq("edition_id", edition?.id ?? "")
    .order("display_order");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catégories pilotes</h1>
        {edition && (
          <p className="mt-1 text-sm text-gray-500">
            Édition active : {edition.name}
          </p>
        )}
      </div>
      <CategoriesManager
        categories={(categories ?? []) as CategoryRow[]}
        editionId={edition?.id ?? ""}
      />
    </div>
  );
}
