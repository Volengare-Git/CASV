"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/supabase/assert-admin";

const uuid = z.string().uuid("ID invalide");

export async function validatePayment(registrationId: string) {
  uuid.parse(registrationId);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "paid" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function cancelRegistration(registrationId: string) {
  uuid.parse(registrationId);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ payment_status: "cancelled" })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function assignDossard(registrationId: string, dossard: number | null) {
  uuid.parse(registrationId);
  z.number().int().min(1).max(999).nullable().parse(dossard);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("registrations")
    .update({ dossard_number: dossard })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setRegistrationOpen(editionId: string, value: boolean | null) {
  uuid.parse(editionId);
  z.boolean().nullable().parse(value);
  const admin = await assertAdmin();
  const { error } = await admin
    .from("editions")
    .update({ is_registration_open: value })
    .eq("id", editionId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

