import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VolunteerStatus, AssignmentMode } from "@/lib/supabase/types";
import BenevolesTable from "./benevoles-table";

export const metadata: Metadata = { title: "Bénévoles — Admin CASV" };

export type VolunteerRow = {
  id: string;
  user_id: string | null;
  status: VolunteerStatus;
  assignment_mode: AssignmentMode;
  notes: string | null;
  created_at: string;
  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  age_group: string | null;
  wants_membership: boolean | null;
  task_interests: Record<string, string> | null;
  assigned_post_ids: string[] | null;
  profiles: { first_name: string; last_name: string } | null;
  editions: { name: string } | null;
};

export type PostOption = {
  id: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  order_code: number | null;
  time_label: string | null;
  capacity: number;
};
export type TaskOption = { id: string; label: string };

export default async function BenevolesAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id")
    .eq("is_active", true)
    .single();

  const editionId = edition?.id ?? "";

  const [{ data: raw }, { data: posts }, { data: tasks }] = await Promise.all([
    admin
      .from("volunteer_registrations")
      .select(
        "id, user_id, status, assignment_mode, notes, created_at, guest_first_name, guest_last_name, guest_email, guest_phone, age_group, wants_membership, task_interests, assigned_post_ids, profiles(first_name, last_name), editions(name)"
      )
      .eq("edition_id", editionId)
      .order("created_at", { ascending: true }),
    admin
      .from("volunteer_posts")
      .select("id, name, start_time, end_time, order_code, time_label, capacity")
      .eq("edition_id", editionId)
      .order("display_order"),
    admin
      .from("volunteer_tasks")
      .select("id, label")
      .eq("edition_id", editionId)
      .order("display_order"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bénévoles</h1>
      <BenevolesTable
        volunteers={(raw ?? []) as VolunteerRow[]}
        posts={(posts ?? []) as PostOption[]}
        tasks={(tasks ?? []) as TaskOption[]}
        editionId={editionId}
      />
    </div>
  );
}
