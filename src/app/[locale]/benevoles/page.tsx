import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BenevolesForm from "./benevoles-form";

export const metadata: Metadata = {
  title: "Devenir bénévole — Grand Prix de Versoix",
};

export type TaskOption = { id: string; label: string; display_order: number };

export default async function BenevolesPage() {
  const supabase = await createClient();

  const { data: edition } = await supabase
    .from("editions")
    .select("id")
    .eq("is_active", true)
    .single();

  const { data: tasks } = await supabase
    .from("volunteer_tasks")
    .select("id, label, display_order")
    .eq("edition_id", edition?.id ?? "")
    .order("display_order");

  return (
    <BenevolesForm
      editionId={edition?.id ?? ""}
      tasks={(tasks ?? []) as TaskOption[]}
    />
  );
}
