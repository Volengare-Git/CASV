import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import PlanningView from "./planning-view";

export const metadata: Metadata = { title: "Planning bénévoles — Admin CASV" };

export type PlanPost = {
  id: string;
  name: string;
  order_code: number | null;
  time_label: string | null;
  end_time: string | null;
  capacity: number;
  assignedVolunteers: { reg_id: string; name: string }[];
};

export type PlanVolunteer = {
  reg_id: string;
  name: string;
  assigned_post_ids: string[];
  task_interests: Record<string, string> | null;
};

export default async function PlanningAdminPage() {
  const admin = createAdminClient();

  const { data: edition } = await admin
    .from("editions")
    .select("id, name")
    .eq("is_active", true)
    .single();

  const editionId = edition?.id ?? "";

  const [{ data: rawPosts }, { data: rawVols }, { data: rawTasks }] = await Promise.all([
    admin
      .from("volunteer_posts")
      .select("id, name, order_code, time_label, end_time, capacity")
      .eq("edition_id", editionId)
      .order("order_code", { ascending: true, nullsFirst: false }),
    admin
      .from("volunteer_registrations")
      .select("id, assigned_post_ids, task_interests, guest_first_name, guest_last_name, profiles(first_name, last_name)")
      .eq("edition_id", editionId),
    admin
      .from("volunteer_tasks")
      .select("id, label")
      .eq("edition_id", editionId)
      .order("display_order"),
  ]);

  type RawPost = {
    id: string; name: string; order_code: number | null;
    time_label: string | null; end_time: string | null; capacity: number;
  };
  type RawVol = {
    id: string; assigned_post_ids: string[] | null;
    task_interests: Record<string, string> | null;
    guest_first_name: string | null; guest_last_name: string | null;
    profiles: { first_name: string; last_name: string } | null;
  };

  const posts = (rawPosts ?? []) as RawPost[];
  const vols  = (rawVols  ?? []) as RawVol[];
  const tasks = (rawTasks ?? []) as { id: string; label: string }[];

  // Build postId → volunteers map
  const postVolunteers = new Map<string, { reg_id: string; name: string }[]>();
  for (const post of posts) postVolunteers.set(post.id, []);

  function volName(v: RawVol): string {
    if (v.profiles) return `${v.profiles.last_name} ${v.profiles.first_name}`;
    return `${v.guest_last_name ?? ""} ${v.guest_first_name ?? ""}`.trim() || "—";
  }

  for (const vol of vols) {
    for (const pid of (vol.assigned_post_ids ?? [])) {
      const bucket = postVolunteers.get(pid);
      if (bucket) bucket.push({ reg_id: vol.id, name: volName(vol) });
    }
  }

  const planPosts: PlanPost[] = posts.map(p => ({
    id:                 p.id,
    name:               p.name,
    order_code:         p.order_code,
    time_label:         p.time_label,
    end_time:           p.end_time,
    capacity:           p.capacity,
    assignedVolunteers: postVolunteers.get(p.id) ?? [],
  }));

  const planVols: PlanVolunteer[] = vols
    .map(v => ({
      reg_id:            v.id,
      name:              volName(v),
      assigned_post_ids: v.assigned_post_ids ?? [],
      task_interests:    v.task_interests,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planning bénévoles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Assignez les bénévoles aux postes · Export Excel identique aux documents officiels ·{" "}
          <strong>{edition?.name ?? "—"}</strong>
        </p>
      </div>
      <PlanningView posts={planPosts} volunteers={planVols} tasks={tasks} />
    </div>
  );
}
