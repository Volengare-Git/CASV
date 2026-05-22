"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/supabase/assert-admin";

export type PostInput = {
  name: string;
  order_code: number | null;
  time_label: string | null;
  end_time: string | null;
  capacity: number;
};

export async function createPost(editionId: string, data: PostInput, displayOrder: number) {
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
  const admin = await assertAdmin();
  const { error } = await admin.from("volunteer_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function reorderPosts(ids: string[]) {
  const admin = await assertAdmin();
  await Promise.all(
    ids.map((id, idx) =>
      admin.from("volunteer_posts").update({ display_order: idx + 1 }).eq("id", id)
    )
  );
  revalidatePath("/", "layout");
}
