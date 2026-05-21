"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { VolunteerRow, PostOption } from "./page";
import type { VolunteerStatus } from "@/lib/supabase/types";
import { assignVolunteerPost } from "../actions";

const STATUS_STYLES: Record<VolunteerStatus, { label: string; class: string }> = {
  pending: { label: "En attente", class: "bg-amber-100 text-amber-800" },
  assigned: { label: "Poste assigné", class: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Confirmé", class: "bg-green-100 text-green-800" },
};

function getDisplayName(v: VolunteerRow): string {
  if (v.profiles) return `${v.profiles.last_name} ${v.profiles.first_name}`;
  return `${v.guest_last_name ?? ""} ${v.guest_first_name ?? ""}`.trim() || "—";
}

function getEmail(v: VolunteerRow): string | null {
  return v.guest_email ?? null;
}

export default function BenevolesTable({
  volunteers,
  posts,
}: {
  volunteers: VolunteerRow[];
  posts: PostOption[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | "all">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = volunteers.filter((v) => {
    const name = getDisplayName(v).toLowerCase();
    const email = getEmail(v)?.toLowerCase() ?? "";
    if (search && !name.includes(search.toLowerCase()) && !email.includes(search.toLowerCase()))
      return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  function handleAssignPost(volunteerRegId: string, postId: string) {
    startTransition(async () => {
      try {
        await assignVolunteerPost(volunteerRegId, postId || null);
        toast.success(postId ? "Poste assigné" : "Assignation retirée");
      } catch {
        toast.error("Erreur lors de l'assignation");
      }
    });
  }

  const counts = {
    total: volunteers.length,
    assigned: volunteers.filter((v) => v.status !== "pending").length,
    pending: volunteers.filter((v) => v.status === "pending").length,
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm text-gray-600">
        <span><strong className="text-gray-900">{counts.total}</strong> bénévoles</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-blue-700">{counts.assigned}</strong> avec poste assigné</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-amber-700">{counts.pending}</strong> en attente</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Rechercher nom, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-56"
        />
        <div className="flex gap-1">
          {(["all", "pending", "assigned", "confirmed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "Tous" : STATUS_STYLES[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <Th>Bénévole</Th>
              <Th>Poste préféré</Th>
              <Th>Poste assigné</Th>
              <Th>Statut</Th>
              <Th>Notes</Th>
              <Th>Inscrit le</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Aucun bénévole trouvé
                </td>
              </tr>
            )}
            {filtered.map((v) => {
              const vstatus = STATUS_STYLES[v.status];
              const email = getEmail(v);
              return (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="font-medium text-gray-900">{getDisplayName(v)}</div>
                    {email && <div className="text-xs text-gray-400 mt-0.5">{email}</div>}
                  </Td>
                  <Td>
                    <span className="text-sm text-gray-600">
                      {v.preferred_post?.name ?? <span className="text-gray-400">—</span>}
                    </span>
                  </Td>
                  <Td>
                    <select
                      disabled={isPending}
                      value={v.assigned_post?.name
                        ? posts.find((p) => p.name === v.assigned_post?.name)?.id ?? ""
                        : ""}
                      onChange={(e) => handleAssignPost(v.id, e.target.value)}
                      className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 max-w-[180px]"
                    >
                      <option value="">— non assigné</option>
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.start_time}–{p.end_time})
                        </option>
                      ))}
                    </select>
                  </Td>
                  <Td>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${vstatus.class}`}>
                      {vstatus.label}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-500 max-w-[160px] block truncate" title={v.notes ?? ""}>
                      {v.notes ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-400">
                      {new Date(v.created_at).toLocaleDateString("fr-CH")}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-gray-700">{children}</td>;
}
