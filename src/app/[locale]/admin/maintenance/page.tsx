// Server Component — no "use client" here
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "@/lib/supabase/assert-admin";
import MaintenanceManager from "./maintenance-manager";

export const metadata: Metadata = { title: "Maintenance — Admin CASV" };

export default async function MaintenancePage() {
  await assertAdmin();

  const admin = createAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("maintenance_mode, maintenance_message, maintenance_until")
    .eq("id", 1)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Maintenance du site</h1>
        <p className="text-sm text-gray-500">
          Activez le mode maintenance pour bloquer l&apos;accès au public pendant une intervention.
        </p>
      </div>
      <MaintenanceManager
        initialEnabled={data?.maintenance_mode ?? false}
        initialMessage={
          data?.maintenance_message ??
          "Le site est temporairement en maintenance. Nous serons de retour très bientôt."
        }
        initialUntil={data?.maintenance_until ?? ""}
      />
    </div>
  );
}
