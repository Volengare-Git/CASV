import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import PostesManager from "./postes-manager";

export const metadata: Metadata = { title: "Postes bénévoles — Admin CASV" };

export type VolunteerPost = {
  id: string;
  name: string;
  order_code: number | null;
  time_label: string | null;
  end_time: string | null;
  capacity: number;
  display_order: number;
  edition_id: string;
};

export default async function PostesAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name")
    .eq("is_active", true)
    .single();

  const { data: posts } = await admin
    .from("volunteer_posts")
    .select("id, name, order_code, time_label, end_time, capacity, display_order, edition_id")
    .eq("edition_id", edition?.id ?? "")
    .order("display_order");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Postes bénévoles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Définissez ici tous les postes de l&apos;événement avec leurs horaires.
          Édition active : <strong>{edition?.name ?? "—"}</strong>
        </p>
      </div>
      <PostesManager
        posts={(posts ?? []) as VolunteerPost[]}
        editionId={edition?.id ?? ""}
      />
    </div>
  );
}
