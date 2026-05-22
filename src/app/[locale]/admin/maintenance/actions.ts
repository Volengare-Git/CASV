"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

export async function setMaintenanceMode(enabled: boolean) {
  z.boolean().parse(enabled);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("app_settings")
    .update({ maintenance_mode: enabled, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateMaintenanceMessage(message: string, until: string) {
  z.string().min(1).max(500).parse(message);
  z.string().max(100).parse(until);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("app_settings")
    .update({
      maintenance_message: message.trim(),
      maintenance_until: until.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
