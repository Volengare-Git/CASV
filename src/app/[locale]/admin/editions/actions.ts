"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const uuid = z.string().uuid("ID invalide");

const editionSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  name: z.string().min(1).max(200),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)"),
  registration_opens_at: z.string().datetime({ offset: true }),
  registration_closes_at: z.string().datetime({ offset: true }),
  max_pilots: z.number().int().min(1).max(500),
  price_chf: z.number().min(0).max(9999),
});

export type EditionFormData = z.infer<typeof editionSchema>;

export async function createEdition(data: EditionFormData) {
  editionSchema.parse(data);
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

  // Copy volunteer posts and registration categories from active edition
  if (activeEdition && newEdition) {
    const { data: posts } = await admin
      .from("volunteer_posts")
      .select("name, description, start_time, end_time, capacity, display_order, order_code, time_label")
      .eq("edition_id", activeEdition.id);

    if (posts && posts.length > 0) {
      await admin.from("volunteer_posts").insert(
        posts.map((p) => ({ ...p, edition_id: newEdition.id }))
      );
    }

    const { data: cats } = await admin
      .from("registration_categories")
      .select("value, label, description, display_order, is_active, min_age, max_age")
      .eq("edition_id", activeEdition.id)
      .order("display_order");

    if (cats && cats.length > 0) {
      await admin.from("registration_categories").insert(
        cats.map((c) => ({ ...c, edition_id: newEdition.id }))
      );
    }

    const { data: tasks } = await admin
      .from("volunteer_tasks")
      .select("label, display_order")
      .eq("edition_id", activeEdition.id)
      .order("display_order");

    if (tasks && tasks.length > 0) {
      await admin.from("volunteer_tasks").insert(
        tasks.map((t) => ({ ...t, edition_id: newEdition.id }))
      );
    }
  }

  revalidatePath("/admin/editions");
  revalidatePath("/", "layout");
  return newEdition;
}

export async function activateEdition(editionId: string) {
  uuid.parse(editionId);
  const admin = await assertAdmin();

  // Deactivate all editions
  await admin.from("editions").update({ is_active: false }).not("id", "is", null);

  // Activate the target edition
  const { error } = await admin
    .from("editions")
    .update({ is_active: true })
    .eq("id", editionId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function updateEdition(editionId: string, data: Partial<EditionFormData>) {
  uuid.parse(editionId);
  editionSchema.partial().parse(data);
  const admin = await assertAdmin();

  const { error } = await admin
    .from("editions")
    .update(data)
    .eq("id", editionId);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
