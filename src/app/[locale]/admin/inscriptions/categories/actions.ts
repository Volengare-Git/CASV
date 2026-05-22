"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const uuid = z.string().uuid("ID invalide");

export async function updateCategory(
  id: string,
  label: string,
  description: string
) {
  uuid.parse(id);
  z.string().min(1).max(100).parse(label);
  z.string().max(500).parse(description);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registration_categories")
    .update({ label: label.trim(), description: description.trim() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function toggleCategory(id: string, isActive: boolean) {
  uuid.parse(id);
  z.boolean().parse(isActive);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registration_categories")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateAgeRange(id: string, minAge: number | null, maxAge: number | null) {
  uuid.parse(id);
  z.number().int().min(0).max(120).nullable().parse(minAge);
  z.number().int().min(0).max(120).nullable().parse(maxAge);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registration_categories")
    .update({ min_age: minAge, max_age: maxAge })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderCategories(ids: string[]) {
  z.array(uuid).max(50).parse(ids);
  const admin = await assertAdmin();
  await Promise.all(
    ids.map((id, idx) =>
      admin
        .from("registration_categories")
        .update({ display_order: idx + 1 })
        .eq("id", id)
    )
  );
  revalidatePath("/", "layout");
}
