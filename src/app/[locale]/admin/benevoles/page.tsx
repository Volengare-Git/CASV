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
  profiles: { first_name: string; last_name: string } | null;
  editions: { name: string } | null;
  preferred_post: { name: string } | null;
  assigned_post: { name: string; start_time: string; end_time: string } | null;
};

export type PostOption = { id: string; name: string; start_time: string; end_time: string };

export default async function BenevolesAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id")
    .eq("is_active", true)
    .single();

  const [{ data: raw }, { data: posts }] = await Promise.all([
    admin
      .from("volunteer_registrations")
      .select(
        "id, user_id, status, assignment_mode, notes, created_at, guest_first_name, guest_last_name, guest_email, profiles(first_name, last_name), editions(name), preferred_post:volunteer_posts!preferred_post_id(name), assigned_post:volunteer_posts!assigned_post_id(name, start_time, end_time)"
      )
      .order("created_at", { ascending: true }),
    admin
      .from("volunteer_posts")
      .select("id, name, start_time, end_time")
      .eq("edition_id", edition?.id ?? "")
      .order("display_order"),
  ]);

  const volunteers = (raw ?? []) as VolunteerRow[];
  const postOptions = (posts ?? []) as PostOption[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bénévoles</h1>
      <BenevolesTable volunteers={volunteers} posts={postOptions} />
    </div>
  );
}
