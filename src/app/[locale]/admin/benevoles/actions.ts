"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const uuid = z.string().uuid("ID invalide");
const uuidArray = z.array(uuid).max(50, "Trop de postes");
const volunteerStatus = z.enum(["pending", "assigned", "confirmed"]);

/** Assign multiple posts to a volunteer */
export async function assignVolunteerPosts(
  volunteerRegId: string,
  postIds: string[]
) {
  uuid.parse(volunteerRegId);
  uuidArray.parse(postIds);
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
  uuid.parse(id);
  uuidArray.parse(postIds);
  volunteerStatus.parse(status);
  z.string().max(1000, "Notes trop longues").parse(notes);
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

/** Add / remove a single post from a volunteer's assignment list */
export async function addPostToVolunteer(volunteerRegId: string, postId: string) {
  uuid.parse(volunteerRegId);
  uuid.parse(postId);
  const admin = await assertAdmin();
  const { data, error: fetchErr } = await admin
    .from("volunteer_registrations")
    .select("assigned_post_ids, status")
    .eq("id", volunteerRegId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  const current = data?.assigned_post_ids ?? [];
  if (current.includes(postId)) return; // already assigned
  const next = [...current, postId];
  const { error } = await admin
    .from("volunteer_registrations")
    .update({ assigned_post_ids: next, assigned_post_id: next[0], status: "assigned", assignment_mode: "manual" })
    .eq("id", volunteerRegId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function removePostFromVolunteer(volunteerRegId: string, postId: string) {
  uuid.parse(volunteerRegId);
  uuid.parse(postId);
  const admin = await assertAdmin();
  const { data, error: fetchErr } = await admin
    .from("volunteer_registrations")
    .select("assigned_post_ids")
    .eq("id", volunteerRegId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  const next = (data?.assigned_post_ids ?? []).filter((id: string) => id !== postId);
  const { error } = await admin
    .from("volunteer_registrations")
    .update({
      assigned_post_ids: next,
      assigned_post_id: next[0] ?? null,
      status: next.length > 0 ? "assigned" : "pending",
      assignment_mode: "manual",
    })
    .eq("id", volunteerRegId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** CRUD for volunteer_tasks */
export async function createTask(editionId: string, label: string, displayOrder: number) {
  uuid.parse(editionId);
  z.string().min(1).max(120).parse(label);
  z.number().int().min(0).max(9999).parse(displayOrder);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .insert({ edition_id: editionId, label: label.trim(), display_order: displayOrder });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateTask(taskId: string, label: string) {
  uuid.parse(taskId);
  z.string().min(1).max(120).parse(label);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .update({ label: label.trim() })
    .eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteTask(taskId: string) {
  uuid.parse(taskId);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_tasks")
    .delete()
    .eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderTasks(taskIds: string[]) {
  z.array(uuid).max(200).parse(taskIds);
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
