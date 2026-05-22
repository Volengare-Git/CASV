"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadResult(formData: FormData) {
  const admin = await assertAdmin();

  const file = formData.get("file") as File;
  const editionId = formData.get("editionId") as string;
  const label = ((formData.get("label") as string) ?? "").trim() || file?.name;

  // Validate inputs before touching storage
  if (!file || file.size === 0) throw new Error("Aucun fichier sélectionné");
  if (file.type !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés");
  if (file.size > MAX_PDF_BYTES) throw new Error("Fichier trop volumineux (max 10 Mo)");
  z.string().uuid("ID d'édition invalide").parse(editionId);
  z.string().max(200).optional().parse(label || undefined);

  // Verify the edition actually exists to prevent arbitrary path injection
  const { data: edition, error: editionErr } = await admin
    .from("editions")
    .select("id")
    .eq("id", editionId)
    .single();
  if (editionErr || !edition) throw new Error("Édition introuvable");

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
  z.string().uuid("ID invalide").parse(id);
  z.string().min(1).max(500).parse(filePath);
  const admin = await assertAdmin();

  // Delete file from storage (ignore missing file errors)
  await admin.storage.from("race-results").remove([filePath]);

  const { error } = await admin.from("race_results").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/resultats");
  revalidatePath("/admin/resultats");
}
