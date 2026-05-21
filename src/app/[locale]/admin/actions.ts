"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/supabase/assert-admin";

export async function validatePayment(registrationId: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "paid" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function cancelRegistration(registrationId: string) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "cancelled" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function assignDossard(registrationId: string, dossard: number | null) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ dossard_number: dossard })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setRegistrationOpen(editionId: string, value: boolean | null) {
  const admin = await assertAdmin();
  const { error } = await admin
    .from("editions")
    .update({ is_registration_open: value })
    .eq("id", editionId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

