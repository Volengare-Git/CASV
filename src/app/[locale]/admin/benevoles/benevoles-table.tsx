"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { VolunteerRow, PostOption, TaskOption } from "./page";
import type { VolunteerStatus } from "@/lib/supabase/types";
import { assignVolunteerPosts } from "./actions";
import { FileSpreadsheet, Printer, ChevronDown } from "lucide-react";

const STATUS_STYLES: Record<VolunteerStatus, { label: string; class: string }> = {
  pending: { label: "En attente", class: "bg-amber-100 text-amber-800" },
  assigned: { label: "Poste(s) assigné(s)", class: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Confirmé", class: "bg-green-100 text-green-800" },
};

function getDisplayName(v: VolunteerRow): string {
  if (v.profiles) return `${v.profiles.last_name} ${v.profiles.first_name}`;
  return `${v.guest_last_name ?? ""} ${v.guest_first_name ?? ""}`.trim() || "—";
}

function getAgeLabel(ageGroup: string | null): string {
  if (ageGroup === "moins_18") return "< 18 ans";
  if (ageGroup === "18_et_plus") return "≥ 18 ans";
  return "—";
}

function getTaskSummary(
  taskInterests: Record<string, string> | null,
  tasks: TaskOption[]
): string {
  if (!taskInterests || tasks.length === 0) return "—";
  let oui = 0;
  let siNec = 0;
  tasks.forEach((t) => {
    const v = taskInterests[t.id];
    if (v === "oui") oui++;
    else if (v === "si_necessaire") siNec++;
  });
  return `${oui} oui · ${siNec} si nec.`;
}

function getTaskDetail(
  taskInterests: Record<string, string> | null,
  tasks: TaskOption[]
): string {
  if (!taskInterests) return "";
  return tasks
    .map((t) => {
      const v = taskInterests[t.id];
      const icon = v === "oui" ? "✓" : v === "si_necessaire" ? "~" : "✗";
      return `${icon} ${t.label}`;
    })
    .join("\n");
}

// Multi-select post dropdown
function PostMultiSelect({
  volunteerRegId,
  assignedIds,
  posts,
  disabled,
}: {
  volunteerRegId: string;
  assignedIds: string[];
  posts: PostOption[];
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(assignedIds);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle(postId: string) {
    setSelected((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  }

  function handleSave() {
    setOpen(false);
    startTransition(async () => {
      try {
        await assignVolunteerPosts(volunteerRegId, selected);
        toast.success(
          selected.length > 0
            ? `${selected.length} poste(s) assigné(s)`
            : "Assignation retirée"
        );
      } catch {
        toast.error("Erreur lors de l'assignation");
      }
    });
  }

  const label =
    selected.length === 0
      ? "— non assigné"
      : selected.length === 1
      ? (posts.find((p) => p.id === selected[0])?.name ?? "1 poste")
      : `${selected.length} postes`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 max-w-[180px] min-w-[120px]"
      >
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-48 overflow-y-auto p-1">
            {posts.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">Aucun poste disponible</p>
            ) : (
              posts.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-start gap-2 rounded px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-0.5 h-3.5 w-3.5 accent-blue-800"
                  />
                  <div>
                    <div className="font-medium text-gray-700">{p.name}</div>
                    <div className="text-gray-400">
                      {p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-3 py-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => { setSelected([]); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-blue-800 px-3 py-1 text-xs font-medium text-white hover:bg-blue-900"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BenevolesTable({
  volunteers,
  posts,
  tasks,
  editionId: _editionId,
}: {
  volunteers: VolunteerRow[];
  posts: PostOption[];
  tasks: TaskOption[];
  editionId: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | "all">("all");

  const filtered = volunteers.filter((v) => {
    const name = getDisplayName(v).toLowerCase();
    const email = (v.guest_email ?? "").toLowerCase();
    const phone = (v.guest_phone ?? "").toLowerCase();
    if (
      search &&
      !name.includes(search.toLowerCase()) &&
      !email.includes(search.toLowerCase()) &&
      !phone.includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: volunteers.length,
    assigned: volunteers.filter((v) => v.status !== "pending").length,
    pending: volunteers.filter((v) => v.status === "pending").length,
    wantsMembership: volunteers.filter((v) => v.wants_membership === true).length,
  };

  // --- Export CSV ---
  function exportCSV() {
    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Tranche d'âge",
      "Veut adhérer",
      "Statut",
      "Postes assignés",
      ...tasks.map((t) => t.label),
      "Notes",
      "Date inscription",
    ];

    const rows = volunteers.map((v) => {
      const assignedNames = (v.assigned_post_ids ?? [])
        .map((id) => posts.find((p) => p.id === id)?.name ?? id)
        .join(" | ");
      return [
        v.guest_last_name ?? v.profiles?.last_name ?? "",
        v.guest_first_name ?? v.profiles?.first_name ?? "",
        v.guest_email ?? "",
        v.guest_phone ?? "",
        getAgeLabel(v.age_group),
        v.wants_membership === true ? "Oui" : v.wants_membership === false ? "Non" : "",
        STATUS_STYLES[v.status].label,
        assignedNames,
        ...tasks.map((t) => {
          const val = v.task_interests?.[t.id];
          if (val === "oui") return "Oui";
          if (val === "si_necessaire") return "Si nécessaire";
          if (val === "non") return "Non";
          return "";
        }),
        v.notes ?? "",
        new Date(v.created_at).toLocaleDateString("fr-CH"),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `benevoles_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Export XLSX ---
  function exportXLSX() {
    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Tranche d'âge",
      "Veut adhérer",
      "Statut",
      "Postes assignés",
      ...tasks.map((t) => t.label),
      "Notes",
      "Date inscription",
    ];

    const rows = volunteers.map((v) => {
      const assignedNames = (v.assigned_post_ids ?? [])
        .map((id) => posts.find((p) => p.id === id)?.name ?? id)
        .join(" | ");
      return [
        v.guest_last_name ?? v.profiles?.last_name ?? "",
        v.guest_first_name ?? v.profiles?.first_name ?? "",
        v.guest_email ?? "",
        v.guest_phone ?? "",
        getAgeLabel(v.age_group),
        v.wants_membership === true ? "Oui" : v.wants_membership === false ? "Non" : "",
        STATUS_STYLES[v.status].label,
        assignedNames,
        ...tasks.map((t) => {
          const val = v.task_interests?.[t.id];
          if (val === "oui") return "Oui";
          if (val === "si_necessaire") return "Si nécessaire";
          if (val === "non") return "Non";
          return "";
        }),
        v.notes ?? "",
        new Date(v.created_at).toLocaleDateString("fr-CH"),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Bold header row
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = { font: { bold: true } };
    }

    // Column widths
    ws["!cols"] = [
      { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 14 },
      { wch: 12 }, { wch: 18 }, { wch: 30 },
      ...tasks.map(() => ({ wch: 14 })),
      { wch: 30 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bénévoles");
    XLSX.writeFile(wb, `benevoles_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // --- Print ---
  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <span><strong className="text-gray-900">{counts.total}</strong> bénévoles</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-blue-700">{counts.assigned}</strong> avec poste(s)</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-amber-700">{counts.pending}</strong> en attente</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-green-700">{counts.wantsMembership}</strong> souhaitent adhérer</span>
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
          <div className="flex gap-1">
            {(["all", "pending", "assigned", "confirmed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_STYLES[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={exportXLSX}
            className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
          >
            <Printer className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <Th>Bénévole</Th>
              <Th>Contact</Th>
              <Th>Âge</Th>
              <Th>Membre ?</Th>
              <Th>Tâches</Th>
              <Th>Postes assignés</Th>
              <Th>Statut</Th>
              <Th>Notes</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-gray-400">
                  Aucun bénévole trouvé
                </td>
              </tr>
            )}
            {filtered.map((v) => {
              const vstatus = STATUS_STYLES[v.status];
              const assignedIds = v.assigned_post_ids ?? [];
              return (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      {getDisplayName(v)}
                    </div>
                  </Td>
                  <Td>
                    {v.guest_email && (
                      <div className="text-xs text-gray-500">{v.guest_email}</div>
                    )}
                    {v.guest_phone && (
                      <div className="text-xs text-gray-400 mt-0.5">{v.guest_phone}</div>
                    )}
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {getAgeLabel(v.age_group)}
                    </span>
                  </Td>
                  <Td>
                    {v.wants_membership === true ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Oui
                      </span>
                    ) : v.wants_membership === false ? (
                      <span className="text-xs text-gray-400">Non</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </Td>
                  <Td>
                    <span
                      className="text-xs text-gray-600 cursor-help"
                      title={getTaskDetail(v.task_interests, tasks)}
                    >
                      {getTaskSummary(v.task_interests, tasks)}
                    </span>
                  </Td>
                  <Td>
                    <PostMultiSelect
                      volunteerRegId={v.id}
                      assignedIds={assignedIds}
                      posts={posts}
                      disabled={false}
                    />
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${vstatus.class}`}
                    >
                      {vstatus.label}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="text-xs text-gray-500 max-w-[140px] block truncate"
                      title={v.notes ?? ""}
                    >
                      {v.notes ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
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
