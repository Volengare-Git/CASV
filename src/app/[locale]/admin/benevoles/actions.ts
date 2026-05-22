"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/supabase/assert-admin";

/** Assign multiple posts to a volunteer */
export async function assignVolunteerPosts(
  volunteerRegId: string,
  postIds: string[]
) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_registrations")
    .update({
      assigned_post_ids: postIds,
      assigned_post_id: postIds[0] ?? null,
      status: postIds.length > 0 ? "assigned" : "pending",
      assignment_mode: "manual",
    })
    .eq("id", volunteerRegId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Save posts + status + notes in one round-trip */
export async function saveVolunteerAssignment(
  id: string,
  postIds: string[],
  status: import("@/lib/supabase/types").VolunteerStatus,
  notes: string
) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_registrations")
    .update({
      assigned_post_ids: postIds,
      assigned_post_id: postIds[0] ?? null,
      status,
      notes: notes.trim() || null,
      assignment_mode: "manual",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** CRUD for volunteer_tasks */
export async function createTask(editionId: string, label: string, displayOrder: number) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .insert({ edition_id: editionId, label: label.trim(), display_order: displayOrder });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateTask(taskId: string, label: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .update({ label: label.trim() })
    .eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteTask(taskId: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .delete()
    .eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderTasks(taskIds: string[]) {
  const admin = await assertAdmin();
  await Promise.all(
    taskIds.map((id, idx) =>
      admin
        .from("volunteer_tasks")
        .update({ display_order: idx + 1 })
        .eq("id", id)
    )
  );
  revalidatePath("/", "layout");
}
