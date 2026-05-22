"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  X, Mail, Phone, UserCheck, ChevronRight,
  FileSpreadsheet, Printer, Check,
} from "lucide-react";
import type { VolunteerRow, PostOption, TaskOption } from "./page";
import type { VolunteerStatus } from "@/lib/supabase/types";
import { saveVolunteerAssignment } from "./actions";

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<VolunteerStatus, { label: string; chip: string; btn: string }> = {
  pending:   { label: "En attente",        chip: "bg-amber-100 text-amber-800",  btn: "bg-amber-500 text-white" },
  assigned:  { label: "Poste(s) assigné(s)", chip: "bg-blue-100 text-blue-800",   btn: "bg-blue-700 text-white" },
  confirmed: { label: "Confirmé",           chip: "bg-green-100 text-green-800", btn: "bg-green-600 text-white" },
};

function displayName(v: VolunteerRow) {
  if (v.profiles) return `${v.profiles.last_name} ${v.profiles.first_name}`;
  return `${v.guest_last_name ?? ""} ${v.guest_first_name ?? ""}`.trim() || "—";
}

function ageLabel(g: string | null) {
  if (g === "moins_18") return "< 18 ans";
  if (g === "18_et_plus") return "≥ 18 ans";
  return "—";
}

function taskSummary(interests: Record<string, string> | null, tasks: TaskOption[]) {
  if (!interests || !tasks.length) return "—";
  let oui = 0, sn = 0;
  tasks.forEach(t => {
    if (interests[t.id] === "oui") oui++;
    else if (interests[t.id] === "si_necessaire") sn++;
  });
  return `${oui} oui · ${sn} si nec.`;
}

function taskDetail(interests: Record<string, string> | null, tasks: TaskOption[]) {
  if (!interests) return "";
  return tasks.map(t => {
    const v = interests[t.id];
    return `${v === "oui" ? "✓" : v === "si_necessaire" ? "~" : "✗"} ${t.label}`;
  }).join("\n");
}

function buildExportData(volunteers: VolunteerRow[], posts: PostOption[], tasks: TaskOption[]) {
  const headers = [
    "Nom","Prénom","Email","Téléphone","Tranche d'âge","Veut adhérer","Statut",
    "Postes assignés",...tasks.map(t => t.label),"Notes","Date inscription",
  ];
  const rows = volunteers.map(v => {
    const assignedNames = (v.assigned_post_ids ?? [])
      .map(id => posts.find(p => p.id === id)?.name ?? id).join(" | ");
    return [
      v.guest_last_name ?? v.profiles?.last_name ?? "",
      v.guest_first_name ?? v.profiles?.first_name ?? "",
      v.guest_email ?? "", v.guest_phone ?? "",
      ageLabel(v.age_group),
      v.wants_membership === true ? "Oui" : v.wants_membership === false ? "Non" : "",
      STATUS_STYLES[v.status].label, assignedNames,
      ...tasks.map(t => {
        const val = v.task_interests?.[t.id];
        return val === "oui" ? "Oui" : val === "si_necessaire" ? "Si nécessaire" : val === "non" ? "Non" : "";
      }),
      v.notes ?? "", new Date(v.created_at).toLocaleDateString("fr-CH"),
    ];
  });
  return { headers, rows };
}

// ─── Slide-over panel ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      {children}
    </p>
  );
}

function VolunteerPanel({
  volunteer,
  posts,
  tasks,
  onClose,
  onSaved,
}: {
  volunteer: VolunteerRow;
  posts: PostOption[];
  tasks: TaskOption[];
  onClose: () => void;
  onSaved: (updated: Partial<VolunteerRow>) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [postIds, setPostIds] = useState<string[]>(volunteer.assigned_post_ids ?? []);
  const [status, setStatus] = useState<VolunteerStatus>(volunteer.status);
  const [notes, setNotes] = useState(volunteer.notes ?? "");
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Enter animation
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // Reset state when volunteer changes
  useEffect(() => {
    setPostIds(volunteer.assigned_post_ids ?? []);
    setStatus(volunteer.status);
    setNotes(volunteer.notes ?? "");
    setDirty(false);
  }, [volunteer.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Focus first element
  useEffect(() => { firstFocusRef.current?.focus(); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function togglePost(id: string) {
    setPostIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    setDirty(true);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveVolunteerAssignment(volunteer.id, postIds, status, notes);
        onSaved({ assigned_post_ids: postIds, status, notes: notes.trim() || null });
        toast.success("Modifications enregistrées");
        setDirty(false);
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'enregistrement");
      }
    });
  }

  const name = displayName(volunteer);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche bénévole — ${name}`}
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {ageLabel(volunteer.age_group)}
              {" · "}Inscrit le {new Date(volunteer.created_at).toLocaleDateString("fr-CH")}
            </p>
          </div>
          <button
            ref={firstFocusRef}
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

          {/* Contact */}
          <section className="px-5 py-4 space-y-2">
            <SectionTitle>Contact</SectionTitle>
            {volunteer.guest_email && (
              <a
                href={`mailto:${volunteer.guest_email}`}
                className="flex items-center gap-2 text-sm text-blue-700 hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {volunteer.guest_email}
              </a>
            )}
            {volunteer.guest_phone && (
              <a
                href={`tel:${volunteer.guest_phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {volunteer.guest_phone}
              </a>
            )}
            {volunteer.wants_membership === true && (
              <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                <UserCheck className="h-4 w-4 shrink-0" />
                Souhaite adhérer à l&apos;association
              </div>
            )}
            {volunteer.wants_membership === false && (
              <div className="text-xs text-gray-400">Adhésion : Non</div>
            )}
          </section>

          {/* Status */}
          <section className="px-5 py-4">
            <SectionTitle>Statut</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {(["pending", "assigned", "confirmed"] as VolunteerStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setDirty(true); }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    status === s
                      ? STATUS_STYLES[s].btn
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {status === s && <Check className="h-3 w-3" />}
                  {STATUS_STYLES[s].label}
                </button>
              ))}
            </div>
          </section>

          {/* Post assignment */}
          <section className="px-5 py-4">
            <SectionTitle>
              Postes assignés
              {postIds.length > 0 && (
                <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[9px] font-bold text-white">
                  {postIds.length}
                </span>
              )}
            </SectionTitle>
            {posts.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun poste configuré pour cette édition.</p>
            ) : (
              <div className="space-y-1">
                {posts.map(p => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      postIds.includes(p.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-transparent hover:border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={postIds.includes(p.id)}
                      onChange={() => togglePost(p.id)}
                      className="h-4 w-4 shrink-0 accent-blue-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${postIds.includes(p.id) ? "text-blue-900" : "text-gray-800"}`}>
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.time_label ?? p.start_time?.slice(0, 5) ?? "—"}
                        {p.end_time ? ` → ${p.end_time.slice(0, 5)}` : ""}
                      </p>
                    </div>
                    {postIds.includes(p.id) && (
                      <Check className="h-4 w-4 shrink-0 text-blue-700" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Task interests */}
          {tasks.length > 0 && (
            <section className="px-5 py-4">
              <SectionTitle>Disponibilités par tâche</SectionTitle>
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                {tasks.map((t, i) => {
                  const val = volunteer.task_interests?.[t.id];
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between px-3 py-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <span className="text-gray-700 truncate pr-3">{t.label}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        val === "oui"
                          ? "bg-green-100 text-green-700"
                          : val === "si_necessaire"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {val === "oui" ? "✓ Oui" : val === "si_necessaire" ? "~ Si nécessaire" : "✗ Non"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="px-5 py-4">
            <SectionTitle>Notes internes</SectionTitle>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setDirty(true); }}
              placeholder="Remarques, contraintes, informations utiles…"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="text-xs text-amber-600 min-w-0 flex-1">
            {dirty && !isPending && "● Modifications non sauvegardées"}
            {isPending && <span className="text-gray-400">Enregistrement…</span>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !dirty}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-40 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export default function BenevolesTable({
  volunteers: initialVolunteers,
  posts,
  tasks,
}: {
  volunteers: VolunteerRow[];
  posts: PostOption[];
  tasks: TaskOption[];
  editionId: string;
}) {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>(initialVolunteers);
  const [selected, setSelected] = useState<VolunteerRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | "all">("all");

  useEffect(() => { setVolunteers(initialVolunteers); }, [initialVolunteers]);

  const filtered = volunteers.filter(v => {
    const text = `${displayName(v)} ${v.guest_email ?? ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: volunteers.length,
    assigned: volunteers.filter(v => v.status !== "pending").length,
    pending: volunteers.filter(v => v.status === "pending").length,
    membership: volunteers.filter(v => v.wants_membership === true).length,
  };

  function handleSaved(id: string, updated: Partial<VolunteerRow>) {
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    setSelected(prev => prev?.id === id ? { ...prev, ...updated } as VolunteerRow : prev);
  }

  // ── Exports ──
  function exportCSV() {
    const { headers, rows } = buildExportData(volunteers, posts, tasks);
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `benevoles_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  function exportXLSX() {
    const { headers, rows } = buildExportData(volunteers, posts, tasks);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[ref]) ws[ref].s = { font: { bold: true } };
    }
    ws["!cols"] = [
      { wch: 18 },{ wch: 18 },{ wch: 28 },{ wch: 16 },{ wch: 14 },
      { wch: 12 },{ wch: 18 },{ wch: 30 },...tasks.map(() => ({ wch: 14 })),
      { wch: 30 },{ wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bénévoles");
    XLSX.writeFile(wb, `benevoles_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <>
      {/* ── Summary ── */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <span><strong className="text-gray-900">{counts.total}</strong> bénévoles</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-blue-700">{counts.assigned}</strong> avec poste(s)</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-amber-700">{counts.pending}</strong> en attente</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-green-700">{counts.membership}</strong> souhaitent adhérer</span>
      </div>

      {/* ── Filters + exports ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
          <div className="flex gap-1">
            {(["all", "pending", "assigned", "confirmed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_STYLES[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportXLSX} className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 print:hidden">
            <Printer className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <Th>Bénévole</Th>
              <Th>Contact</Th>
              <Th>Âge</Th>
              <Th>Tâches</Th>
              <Th>Postes</Th>
              <Th>Statut</Th>
              <Th>Date</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  Aucun bénévole trouvé
                </td>
              </tr>
            )}
            {filtered.map(v => {
              const isActive = selected?.id === v.id;
              const assignedCount = (v.assigned_post_ids ?? []).length;
              const vstatus = STATUS_STYLES[v.status];
              return (
                <tr
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`cursor-pointer transition-colors ${
                    isActive ? "bg-blue-50" : "hover:bg-gray-50/80"
                  }`}
                >
                  <Td>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      {displayName(v)}
                    </div>
                    {v.wants_membership && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                        <UserCheck className="h-3 w-3" /> Adhésion
                      </span>
                    )}
                  </Td>
                  <Td>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">{v.guest_email ?? "—"}</div>
                    {v.guest_phone && <div className="text-xs text-gray-400 mt-0.5">{v.guest_phone}</div>}
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{ageLabel(v.age_group)}</span>
                  </Td>
                  <Td>
                    <span
                      className="text-xs text-gray-600 cursor-help"
                      title={taskDetail(v.task_interests, tasks)}
                    >
                      {taskSummary(v.task_interests, tasks)}
                    </span>
                  </Td>
                  <Td>
                    {assignedCount > 0 ? (
                      <div className="space-y-0.5">
                        {(v.assigned_post_ids ?? []).slice(0, 2).map(id => (
                          <div key={id} className="text-xs text-blue-700 font-medium whitespace-nowrap">
                            {posts.find(p => p.id === id)?.name ?? "Poste"}
                          </div>
                        ))}
                        {assignedCount > 2 && (
                          <div className="text-xs text-gray-400">+{assignedCount - 2} autre(s)</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">— non assigné</span>
                    )}
                  </Td>
                  <Td>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${vstatus.chip}`}>
                      {vstatus.label}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(v.created_at).toLocaleDateString("fr-CH")}
                    </span>
                  </Td>
                  <Td>
                    <ChevronRight className={`h-4 w-4 transition-colors ${isActive ? "text-blue-600" : "text-gray-300"}`} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Slide-over panel ── */}
      {selected && (
        <VolunteerPanel
          volunteer={selected}
          posts={posts}
          tasks={tasks}
          onClose={() => setSelected(null)}
          onSaved={updated => handleSaved(selected.id, updated)}
        />
      )}
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-gray-700">{children}</td>;
}
