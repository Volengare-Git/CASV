"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/supabase/assert-admin";

export async function uploadResult(formData: FormData) {
  const admin = await assertAdmin();

  const file = formData.get("file") as File;
  const editionId = formData.get("editionId") as string;
  const label = ((formData.get("label") as string) ?? "").trim() || file?.name;

  if (!file || file.size === 0) throw new Error("Aucun fichier sélectionné");
  if (file.type !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés");
  if (!editionId) throw new Error("Édition manquante");

  // Sanitize filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${editionId}/${Date.now()}-${safeName}`;

  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("race-results")
    .upload(filePath, bytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await admin.from("race_results").insert({
    edition_id: editionId,
    label,
    file_path: filePath,
    file_name: file.name,
  });

  if (dbError) {
    // Rollback storage upload on DB failure
    await admin.storage.from("race-results").remove([filePath]);
    throw new Error(dbError.message);
  }

  revalidatePath("/resultats");
  revalidatePath("/admin/resultats");
}

export async function deleteResult(id: string, filePath: string) {
  const admin = await assertAdmin();

  // Delete file from storage (ignore missing file errors)
  await admin.storage.from("race-results").remove([filePath]);

  const { error } = await admin.from("race_results").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/resultats");
  revalidatePath("/admin/resultats");
}
