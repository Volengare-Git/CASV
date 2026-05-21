"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return createAdminClient();
}

export async function validatePayment(registrationId: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "paid" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function cancelRegistration(registrationId: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "cancelled" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function assignDossard(registrationId: string, dossard: number | null) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ dossard_number: dossard })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function assignVolunteerPost(volunteerRegId: string, postId: string | null) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_registrations")
    .update({
      assigned_post_id: postId,
      status: postId ? "assigned" : "pending",
      assignment_mode: "manual",
    })
    .eq("id", volunteerRegId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
