"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/supabase/assert-admin";

export async function updateCategory(
  id: string,
  label: string,
  description: string
) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registration_categories")
    .update({ label: label.trim(), description: description.trim() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function toggleCategory(id: string, isActive: boolean) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registration_categories")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderCategories(ids: string[]) {
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
