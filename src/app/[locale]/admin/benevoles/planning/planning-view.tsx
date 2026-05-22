"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Plus, X, FileSpreadsheet, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { addPostToVolunteer, removePostFromVolunteer } from "../actions";
import type { PlanPost, PlanVolunteer } from "./page";

type TaskLabel = { id: string; label: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGroup(code: number | null): string {
  if (code === null) return "Sans ordre";
  if (code < 700)   return "Avant le jour J";
  if (code < 900)   return "Jour J · 7h–9h";
  if (code < 1000)  return "Jour J · 9h–10h";
  if (code < 1100)  return "Jour J · 10h–11h";
  if (code < 1200)  return "Jour J · 11h–12h";
  if (code < 1400)  return "Jour J · Midi–14h";
  if (code < 1600)  return "Jour J · 14h–16h";
  if (code < 2000)  return "Jour J · Fin de journée";
  return "Après le jour J";
}

function displayTime(time_label: string | null, end_time: string | null): string {
  const from = time_label;
  const to   = end_time ?? null;
  if (!from && !to) return "—";
  if (!to || to === "—") return from ?? "—";
  return `${from} → ${to}`;
}

function CapacityBadge({ assigned, capacity }: { assigned: number; capacity: number }) {
  if (capacity === 0) return null;
  const over = assigned > capacity;
  const full = assigned >= capacity;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      over ? "bg-red-100 text-red-700" : full ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
    }`}>
      {over  ? <AlertCircle className="h-3 w-3" />
             : full ? <CheckCircle className="h-3 w-3" />
             : <Users className="h-3 w-3" />}
      {assigned}/{capacity}
    </span>
  );
}

/** Compact summary of oui/si_necessaire interests for a given post name context */
function interestSummary(vol: PlanVolunteer, tasks: TaskLabel[]): string {
  if (!vol.task_interests || !tasks.length) return "";
  const yes = tasks.filter(t => vol.task_interests![t.id] === "oui").map(t => `✓ ${t.label}`);
  const maybe = tasks.filter(t => vol.task_interests![t.id] === "si_necessaire").map(t => `~ ${t.label}`);
  return [...yes, ...maybe].join("  ·  ") || "";
}

// ─── Excel export ─────────────────────────────────────────────────────────────

function exportXLSX(posts: PlanPost[], volunteers: PlanVolunteer[]) {
  const postMap = new Map(posts.map(p => [p.id, p]));
  const header = ["de", "à", "quoi", "ordre", "qui"];

  // Sheet 1 — par horaire
  const rows1: (string | number | null)[][] = [];
  for (const post of [...posts].sort((a, b) => (a.order_code ?? 9999) - (b.order_code ?? 9999))) {
    const vols = [...post.assignedVolunteers].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (vols.length === 0) {
      rows1.push([post.time_label ?? "—", post.end_time ?? "—", post.name, post.order_code ?? "", "—"]);
    } else {
      for (const v of vols)
        rows1.push([post.time_label ?? "—", post.end_time ?? "—", post.name, post.order_code ?? "", v.name]);
    }
  }

  // Sheet 2 — par personne
  const rows2: (string | number | null)[][] = [];
  for (const vol of [...volunteers].filter(v => v.assigned_post_ids.length > 0).sort((a, b) => a.name.localeCompare(b.name, "fr"))) {
    const vPosts = vol.assigned_post_ids.map(id => postMap.get(id)).filter(Boolean)
      .sort((a, b) => (a!.order_code ?? 9999) - (b!.order_code ?? 9999));
    for (const p of vPosts)
      if (p) rows2.push([p.time_label ?? "—", p.end_time ?? "—", p.name, p.order_code ?? "", vol.name]);
  }

  function makeSheet(rows: (string | number | null)[][]) {
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 40 }, { wch: 8 }, { wch: 28 }];
    for (let c = 0; c < 5; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[ref]) ws[ref].s = { font: { bold: true } };
    }
    return ws;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(rows1), "Par horaire");
  XLSX.utils.book_append_sheet(wb, makeSheet(rows2), "Par personne");
  XLSX.writeFile(wb, `attributions_benevoles_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Volunteer picker ─────────────────────────────────────────────────────────
// Uses position: fixed so it escapes overflow-hidden containers

type PickerPos = { top: number; right: number };

function VolunteerPicker({
  post,
  allVolunteers,
  tasks,
  pos,
  onAdd,
  onClose,
}: {
  post: PlanPost;
  allVolunteers: PlanVolunteer[];
  tasks: TaskLabel[];
  pos: PickerPos;
  onAdd: (reg_id: string, name: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const assignedIds = new Set(post.assignedVolunteers.map(v => v.reg_id));

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = allVolunteers
    .filter(v => !assignedIds.has(v.reg_id))
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  function handleAdd(vol: PlanVolunteer) {
    startTransition(async () => {
      try {
        await addPostToVolunteer(vol.reg_id, post.id);
        onAdd(vol.reg_id, vol.name);
        toast.success(`${vol.name} assigné(e)`);
      } catch {
        toast.error("Erreur lors de l'assignation");
      }
    });
  }

  return (
    /* fixed: escapes any overflow-hidden parent */
    <div
      data-picker
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-72 rounded-xl border border-gray-200 bg-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <p className="text-xs font-semibold text-gray-700 truncate flex-1">{post.name}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Search */}
      <div className="px-2 pt-2">
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un bénévole…"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Results */}
      <ul className="max-h-64 overflow-y-auto pb-1">
        {filtered.length === 0 && (
          <li className="px-3 py-3 text-xs text-gray-400 text-center">
            {search ? "Aucun résultat" : allVolunteers.filter(v => !assignedIds.has(v.reg_id)).length === 0 ? "Tous les bénévoles sont assignés" : "Tous les bénévoles inscrits"}
          </li>
        )}
        {filtered.map(vol => {
          const summary = interestSummary(vol, tasks);
          return (
            <li key={vol.reg_id} className="mx-1.5 my-0.5">
              <button
                onClick={() => handleAdd(vol)}
                disabled={isPending}
                className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
              >
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-800">{vol.name}</p>
                {summary && (
                  <p className="mt-0.5 text-[10px] text-gray-400 leading-tight truncate">{summary}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {/* Already assigned */}
      {post.assignedVolunteers.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-300 mb-1">Déjà assignés</p>
          <div className="flex flex-wrap gap-1">
            {post.assignedVolunteers.map(v => (
              <span key={v.reg_id} className="text-[10px] rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">{v.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── By-horaire view ──────────────────────────────────────────────────────────

function ByHoraireView({
  posts,
  volunteers,
  tasks,
  onAdd,
  onRemove,
}: {
  posts: PlanPost[];
  volunteers: PlanVolunteer[];
  tasks: TaskLabel[];
  onAdd: (postId: string, reg_id: string, name: string) => void;
  onRemove: (postId: string, reg_id: string) => void;
}) {
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<PickerPos>({ top: 0, right: 0 });
  const [isPendingRemove, startRemove] = useTransition();

  // Close picker on outside click
  useEffect(() => {
    if (!openPostId) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-picker]")) setOpenPostId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPostId]);

  function openPicker(e: React.MouseEvent<HTMLButtonElement>, postId: string) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPickerPos({
      top:   rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right - 4),
    });
    setOpenPostId(prev => prev === postId ? null : postId);
  }

  function handleRemove(postId: string, reg_id: string, name: string) {
    startRemove(async () => {
      try {
        await removePostFromVolunteer(reg_id, postId);
        onRemove(postId, reg_id);
        toast.success(`${name} retiré(e)`);
      } catch {
        toast.error("Erreur lors du retrait");
      }
    });
  }

  // Group by time block
  const groups = new Map<string, PlanPost[]>();
  for (const post of posts) {
    const g = getGroup(post.order_code);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(post);
  }

  const openPost = posts.find(p => p.id === openPostId) ?? null;

  return (
    <>
      <div className="space-y-5">
        {Array.from(groups.entries()).map(([group, groupPosts]) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1">
              {group}
            </h3>
            {/* No overflow-hidden so picker can escape */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full">
                <thead className="bg-gray-50 rounded-t-xl">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase w-12 rounded-tl-xl">#</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase w-36">Horaire</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Poste</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Assignés</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase w-20 text-center">Cap.</th>
                    <th className="w-10 rounded-tr-xl" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupPosts.map((post, idx) => (
                    <tr
                      key={post.id}
                      className={`hover:bg-gray-50/50 ${idx === groupPosts.length - 1 ? "last-row" : ""}`}
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] font-mono text-gray-300">{post.order_code ?? "—"}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="h-3 w-3 shrink-0 text-gray-300" />
                          {displayTime(post.time_label, post.end_time)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-sm font-medium text-gray-800">{post.name}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {post.assignedVolunteers.length === 0 && (
                            <span className="text-xs text-gray-300 italic">—</span>
                          )}
                          {post.assignedVolunteers.map(v => (
                            <span
                              key={v.reg_id}
                              className="group inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                            >
                              {v.name}
                              <button
                                onClick={() => handleRemove(post.id, v.reg_id, v.name)}
                                disabled={isPendingRemove}
                                className="rounded-full text-blue-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Retirer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <CapacityBadge assigned={post.assignedVolunteers.length} capacity={post.capacity} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          data-picker
                          onClick={e => openPicker(e, post.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                            openPostId === post.id
                              ? "bg-blue-700 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700"
                          }`}
                          title="Assigner un bénévole"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Picker rendered at root level so it's never clipped */}
      {openPost && (
        <VolunteerPicker
          post={openPost}
          allVolunteers={volunteers}
          tasks={tasks}
          pos={pickerPos}
          onAdd={(reg_id, name) => { onAdd(openPost.id, reg_id, name); setOpenPostId(null); }}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </>
  );
}

// ─── By-personne view ─────────────────────────────────────────────────────────

function ByPersonneView({ posts, volunteers }: { posts: PlanPost[]; volunteers: PlanVolunteer[] }) {
  const postMap = new Map(posts.map(p => [p.id, p]));
  const assigned   = volunteers.filter(v => v.assigned_post_ids.length > 0);
  const unassigned = volunteers.filter(v => v.assigned_post_ids.length === 0);
  const [showUnassigned, setShowUnassigned] = useState(false);

  return (
    <div className="space-y-2">
      {assigned.map(vol => {
        const volPosts = vol.assigned_post_ids.map(id => postMap.get(id)).filter(Boolean)
          .sort((a, b) => (a!.order_code ?? 9999) - (b!.order_code ?? 9999));
        return (
          <div key={vol.reg_id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-900">{vol.name}</span>
              <span className="text-xs text-gray-400">{volPosts.length} poste{volPosts.length > 1 ? "s" : ""}</span>
            </div>
            <table className="min-w-full">
              <tbody>
                {volPosts.map((p, i) => p && (
                  <tr key={p.id} className={`divide-y divide-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                    <td className="px-4 py-2 w-12">
                      <span className="text-[10px] font-mono text-gray-300">{p.order_code ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2 w-40">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{displayTime(p.time_label, p.end_time)}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm text-gray-800">{p.name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {unassigned.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowUnassigned(s => !s)} className="text-sm text-gray-400 hover:text-gray-600">
            {showUnassigned ? "▾" : "▸"} {unassigned.length} bénévole{unassigned.length > 1 ? "s" : ""} sans poste
          </button>
          {showUnassigned && (
            <div className="mt-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 flex flex-wrap gap-2">
              {unassigned.map(v => (
                <span key={v.reg_id} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-500">{v.name}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlanningView({
  posts: initialPosts,
  volunteers: initialVolunteers,
  tasks,
}: {
  posts: PlanPost[];
  volunteers: PlanVolunteer[];
  tasks: TaskLabel[];
}) {
  const [tab, setTab]             = useState<"horaire" | "personne">("horaire");
  const [posts, setPosts]         = useState<PlanPost[]>(initialPosts);
  const [volunteers, setVols]     = useState<PlanVolunteer[]>(initialVolunteers);
  const router = useRouter();

  useEffect(() => { setPosts(initialPosts); },    [initialPosts]);
  useEffect(() => { setVols(initialVolunteers); }, [initialVolunteers]);

  const totalAssigned    = volunteers.filter(v => v.assigned_post_ids.length > 0).length;
  const totalUnassigned  = volunteers.length - totalAssigned;
  const totalPostsFilled = posts.filter(p => p.capacity > 0 && p.assignedVolunteers.length >= p.capacity).length;

  function handleAdd(postId: string, reg_id: string, name: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, assignedVolunteers: [...p.assignedVolunteers, { reg_id, name }] } : p
    ));
    setVols(prev => prev.map(v =>
      v.reg_id === reg_id ? { ...v, assigned_post_ids: [...v.assigned_post_ids, postId] } : v
    ));
    router.refresh();
  }

  function handleRemove(postId: string, reg_id: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, assignedVolunteers: p.assignedVolunteers.filter(v => v.reg_id !== reg_id) } : p
    ));
    setVols(prev => prev.map(v =>
      v.reg_id === reg_id ? { ...v, assigned_post_ids: v.assigned_post_ids.filter(id => id !== postId) } : v
    ));
    router.refresh();
  }

  return (
    <div>
      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-600">
        <span><strong className="text-gray-900">{posts.length}</strong> postes</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-green-700">{totalPostsFilled}</strong> postes complets</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-gray-900">{volunteers.length}</strong> bénévoles</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-blue-700">{totalAssigned}</strong> assignés</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-amber-700">{totalUnassigned}</strong> sans poste</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
          {(["horaire", "personne"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "horaire" ? "Par horaire" : "Par personne"}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportXLSX(posts, volunteers)}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export Excel (horaire + personne)
        </button>
      </div>

      {tab === "horaire" ? (
        <ByHoraireView
          posts={posts}
          volunteers={volunteers}
          tasks={tasks}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      ) : (
        <ByPersonneView posts={posts} volunteers={volunteers} />
      )}
    </div>
  );
}
