"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelOwnRegistration(registrationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Verify the registration belongs to the current user before cancelling
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, payment_status, user_id")
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .single();

  if (!reg) throw new Error("Inscription introuvable");
  if (reg.payment_status === "cancelled" || reg.payment_status === "refunded") {
    throw new Error("Cette inscription est déjà annulée");
  }

  const { error } = await supabase
    .from("registrations")
    .update({ payment_status: "cancelled" })
    .eq("id", registrationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/compte");
}
