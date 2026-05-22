import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Wrench, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Maintenance — CASV Versoix" };

export default async function MaintenancePage() {
  // Fetch message directly — this page is shown during maintenance
  const admin = createAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("maintenance_message, maintenance_until")
    .eq("id", 1)
    .single();

  const message = data?.maintenance_message ?? "Le site est temporairement en maintenance.";
  const until   = data?.maintenance_until ?? null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-2 ring-amber-100">
          <Wrench className="h-10 w-10 text-amber-600" />
        </div>

        {/* Badge */}
        <span className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800">
          Maintenance en cours
        </span>

        {/* Titre */}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Grand-Prix de Versoix
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 leading-relaxed mb-2">
          {message}
        </p>

        {until && (
          <p className="text-sm text-amber-700 font-medium mb-8">
            Retour prévu : {until}
          </p>
        )}
        {!until && <div className="mb-8" />}

        {/* Contact */}
        <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-3">
            Pour toute urgence, contactez l&apos;association directement :
          </p>
          <a
            href="mailto:info@casv.ch"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
          >
            <Mail className="h-4 w-4" />
            info@casv.ch
          </a>
        </div>
      </div>
    </div>
  );
}
