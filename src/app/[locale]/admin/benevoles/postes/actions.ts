"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const uuid = z.string().uuid("ID invalide");

const postInputSchema = z.object({
  name: z.string().min(1).max(200),
  order_code: z.number().int().min(0).max(99999).nullable(),
  time_label: z.string().max(50).nullable(),
  end_time: z.string().max(10).nullable(),
  capacity: z.number().int().min(1).max(999),
});

export type PostInput = z.infer<typeof postInputSchema>;

export async function createPost(editionId: string, data: PostInput, displayOrder: number) {
  uuid.parse(editionId);
  postInputSchema.parse(data);
  z.number().int().min(0).max(9999).parse(displayOrder);
  const admin = await assertAdmin();
  const { error } = await admin.from("volunteer_posts").insert({
    edition_id: editionId,
    name: data.name.trim(),
    description: null,
    order_code: data.order_code,
    time_label: data.time_label?.trim() || null,
    end_time: data.end_time?.trim() || null,
    start_time: null,
    capacity: data.capacity,
    display_order: displayOrder,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updatePost(id: string, data: PostInput) {
  uuid.parse(id);
  postInputSchema.parse(data);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("volunteer_posts")
    .update({
      name: data.name.trim(),
      order_code: data.order_code,
      time_label: data.time_label?.trim() || null,
      end_time: data.end_time?.trim() || null,
      capacity: data.capacity,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deletePost(id: string) {
  uuid.parse(id);
  const admin = await assertAdmin();
  const { error } = await admin.from("volunteer_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderPosts(ids: string[]) {
  z.array(uuid).max(500).parse(ids);
  const admin = await assertAdmin();
  await Promise.all(
    ids.map((id, idx) =>
      admin.from("volunteer_posts").update({ display_order: idx + 1 }).eq("id", id)
    )
  );
  revalidatePath("/", "layout");
}
