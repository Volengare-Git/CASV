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

export interface EditionFormData {
  year: number;
  name: string;
  event_date: string;
  registration_opens_at: string;
  registration_closes_at: string;
  max_pilots: number;
  price_chf: number;
}

export async function createEdition(data: EditionFormData) {
  const admin = await assertAdmin();

  // Get the currently active edition to copy volunteer posts
  const { data: activeEdition } = await admin
    .from("editions")
    .select("id")
    .eq("is_active", true)
    .single();

  // Insert the new edition
  const { data: newEdition, error } = await admin
    .from("editions")
    .insert({
      year: data.year,
      name: data.name,
      event_date: data.event_date,
      registration_opens_at: data.registration_opens_at,
      registration_closes_at: data.registration_closes_at,
      max_pilots: data.max_pilots,
      price_chf: data.price_chf,
      is_active: false,
      is_registration_open: null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Copy volunteer posts from active edition
  if (activeEdition && newEdition) {
    const { data: posts } = await admin
      .from("volunteer_posts")
      .select("name, description, start_time, end_time, capacity, display_order")
      .eq("edition_id", activeEdition.id);

    if (posts && posts.length > 0) {
      await admin.from("volunteer_posts").insert(
        posts.map((p) => ({ ...p, edition_id: newEdition.id }))
      );
    }
  }

  revalidatePath("/admin/editions");
  revalidatePath("/", "layout");
  return newEdition;
}

export async function activateEdition(editionId: string) {
  const admin = await assertAdmin();

  // Deactivate all editions
  await admin.from("editions").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");

  // Activate the target edition
  const { error } = await admin
    .from("editions")
    .update({ is_active: true })
    .eq("id", editionId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function updateEdition(editionId: string, data: Partial<EditionFormData>) {
  const admin = await assertAdmin();

  const { error } = await admin
    .from("editions")
    .update(data)
    .eq("id", editionId);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
