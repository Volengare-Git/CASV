import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { FileText, Download } from "lucide-react";

export const metadata: Metadata = { title: "Résultats — CASV Versoix" };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getPublicUrl(filePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/race-results/${filePath}`;
}

export default async function ResultatsPage() {
  const admin = createAdminClient();

  const [{ data: editions }, { data: results }] = await Promise.all([
    admin
      .from("editions")
      .select("id, name, year")
      .order("year", { ascending: false }),
    admin
      .from("race_results")
      .select("id, edition_id, label, file_path, file_name, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const byEdition = (editions ?? [])
    .map((e) => ({
      edition: e,
      files: (results ?? []).filter((r) => r.edition_id === e.id),
    }))
    .filter((g) => g.files.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
        Résultats
      </h1>
      <p className="text-gray-500 mb-10">
        Classements des éditions du Grand-Prix de Versoix.
      </p>

      {byEdition.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm">
            Les résultats seront publiés après la course.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {byEdition.map(({ edition, files }) => (
            <section key={edition.id}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {edition.name}
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {files.map((f) => (
                    <li key={f.id}>
                      <a
                        href={getPublicUrl(f.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 flex-shrink-0 text-red-400" />
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-800 transition-colors">
                            {f.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
