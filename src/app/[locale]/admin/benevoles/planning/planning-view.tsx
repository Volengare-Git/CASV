"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Plus, X, FileSpreadsheet, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { addPostToVolunteer, removePostFromVolunteer } from "../actions";
import type { PlanPost, PlanVolunteer } from "./page";

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
  const from = time_label ?? null;
  const to   = end_time ? end_time.slice(0, 5) : null;
  if (!from && !to) return "—";
  if (!to || to === "—") return from ?? "—";
  return `${from} → ${to}`;
}

function capacityBadge(assigned: number, capacity: number) {
  if (capacity === 0) return null;
  const full = assigned >= capacity;
  const over = assigned > capacity;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      over  ? "bg-red-100 text-red-700" :
      full  ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-500"
    }`}>
      {over  ? <AlertCircle className="h-3 w-3" /> :
       full  ? <CheckCircle className="h-3 w-3" /> :
               <Users className="h-3 w-3" />}
      {assigned}/{capacity}
    </span>
  );
}

function exportXLSX(posts: PlanPost[], volunteers: PlanVolunteer[]) {
  // Build post lookup
  const postMap = new Map(posts.map(p => [p.id, p]));

  // Sheet 1 — par horaire (sorted by order_code, then by volunteer name)
  const rows1: (string | number | null)[][] = [];
  const sortedPosts = [...posts].sort((a, b) => (a.order_code ?? 9999) - (b.order_code ?? 9999));
  for (const post of sortedPosts) {
    const vols = post.assignedVolunteers.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (vols.length === 0) {
      rows1.push([post.time_label ?? "—", post.end_time ?? "—", post.name, post.order_code ?? "", "—"]);
    } else {
      for (const v of vols) {
        rows1.push([post.time_label ?? "—", post.end_time ?? "—", post.name, post.order_code ?? "", v.name]);
      }
    }
  }

  // Sheet 2 — par personne (sorted by name, then by order_code)
  const rows2: (string | number | null)[][] = [];
  const sortedVols = [...volunteers].filter(v => v.assigned_post_ids.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  for (const vol of sortedVols) {
    const volPosts = vol.assigned_post_ids
      .map(id => postMap.get(id))
      .filter(Boolean)
      .sort((a, b) => (a!.order_code ?? 9999) - (b!.order_code ?? 9999));
    for (const p of volPosts) {
      if (p) rows2.push([p.time_label ?? "—", p.end_time ?? "—", p.name, p.order_code ?? "", vol.name]);
    }
  }

  const header = ["de", "à", "quoi", "ordre", "qui"];
  const wb = XLSX.utils.book_new();

  function makeSheet(rows: (string | number | null)[][]) {
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 40 }, { wch: 8 }, { wch: 28 }];
    // Bold header
    for (let c = 0; c < 5; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[ref]) ws[ref].s = { font: { bold: true } };
    }
    return ws;
  }

  XLSX.utils.book_append_sheet(wb, makeSheet(rows1), "Par horaire");
  XLSX.utils.book_append_sheet(wb, makeSheet(rows2), "Par personne");
  XLSX.writeFile(wb, `attributions_benevoles_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Volunteer picker popover ─────────────────────────────────────────────────

function VolunteerPicker({
  post,
  allVolunteers,
  onAdd,
  onClose,
}: {
  post: PlanPost;
  allVolunteers: PlanVolunteer[];
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
    .slice(0, 8);

  function handleAdd(vol: PlanVolunteer) {
    startTransition(async () => {
      try {
        await addPostToVolunteer(vol.reg_id, post.id);
        onAdd(vol.reg_id, vol.name);
        toast.success(`${vol.name} ajouté(e) au poste`);
      } catch {
        toast.error("Erreur lors de l'assignation");
      }
    });
  }

  return (
    <div className="absolute z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-xl">
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un bénévole…"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <ul className="max-h-52 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-xs text-gray-400">
            {search ? "Aucun résultat" : "Tous les bénévoles sont déjà assignés"}
          </li>
        )}
        {filtered.map(vol => (
          <li key={vol.reg_id}>
            <button
              onClick={() => handleAdd(vol)}
              disabled={isPending}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors disabled:opacity-50"
            >
              {vol.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 px-2 py-1.5">
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Fermer</button>
      </div>
    </div>
  );
}

// ─── By-horaire view ──────────────────────────────────────────────────────────

function ByHoraireView({
  posts,
  volunteers,
  openPickerId,
  setOpenPickerId,
  onAdd,
  onRemove,
}: {
  posts: PlanPost[];
  volunteers: PlanVolunteer[];
  openPickerId: string | null;
  setOpenPickerId: (id: string | null) => void;
  onAdd: (postId: string, reg_id: string, name: string) => void;
  onRemove: (postId: string, reg_id: string) => void;
}) {
  const [isPendingRemove, startRemove] = useTransition();

  // Group by time block
  const groups = new Map<string, PlanPost[]>();
  for (const post of posts) {
    const g = getGroup(post.order_code);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(post);
  }

  function handleRemove(postId: string, reg_id: string, name: string) {
    startRemove(async () => {
      try {
        await removePostFromVolunteer(reg_id, postId);
        onRemove(postId, reg_id);
        toast.success(`${name} retiré(e) du poste`);
      } catch {
        toast.error("Erreur lors du retrait");
      }
    });
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([group, groupPosts]) => (
        <div key={group}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1">
            {group}
          </h3>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase w-12">#</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase w-40">Horaire</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Poste</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Assignés</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase w-24 text-center">Cap.</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50">
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
                          <span className="text-xs text-gray-300 italic">Non assigné</span>
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
                              className="rounded-full text-blue-400 hover:text-red-500 transition-colors"
                              title="Retirer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {capacityBadge(post.assignedVolunteers.length, post.capacity)}
                    </td>
                    <td className="px-3 py-2.5 relative">
                      <button
                        onClick={() => setOpenPickerId(openPickerId === post.id ? null : post.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="Assigner un bénévole"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      {openPickerId === post.id && (
                        <VolunteerPicker
                          post={post}
                          allVolunteers={volunteers}
                          onAdd={(reg_id, name) => { onAdd(post.id, reg_id, name); setOpenPickerId(null); }}
                          onClose={() => setOpenPickerId(null)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── By-personne view ─────────────────────────────────────────────────────────

function ByPersonneView({
  posts,
  volunteers,
}: {
  posts: PlanPost[];
  volunteers: PlanVolunteer[];
}) {
  const postMap = new Map(posts.map(p => [p.id, p]));
  const assigned   = volunteers.filter(v => v.assigned_post_ids.length > 0);
  const unassigned = volunteers.filter(v => v.assigned_post_ids.length === 0);
  const [showUnassigned, setShowUnassigned] = useState(false);

  return (
    <div className="space-y-2">
      {assigned.map(vol => {
        const volPosts = vol.assigned_post_ids
          .map(id => postMap.get(id))
          .filter(Boolean)
          .sort((a, b) => (a!.order_code ?? 9999) - (b!.order_code ?? 9999));
        return (
          <div key={vol.reg_id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-900">{vol.name}</span>
              <span className="text-xs text-gray-400">{volPosts.length} poste{volPosts.length > 1 ? "s" : ""}</span>
            </div>
            <table className="min-w-full divide-y divide-gray-50">
              <tbody>
                {volPosts.map((p, i) => p && (
                  <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-4 py-2 w-12">
                      <span className="text-[10px] font-mono text-gray-300">{p.order_code ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2 w-40">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {displayTime(p.time_label, p.end_time)}
                      </span>
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
          <button
            onClick={() => setShowUnassigned(s => !s)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showUnassigned ? "▾" : "▸"} {unassigned.length} bénévole{unassigned.length > 1 ? "s" : ""} sans poste
          </button>
          {showUnassigned && (
            <div className="mt-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
              <div className="flex flex-wrap gap-2">
                {unassigned.map(v => (
                  <span key={v.reg_id} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-500">
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlanningView({
  posts: initialPosts,
  volunteers: initialVolunteers,
}: {
  posts: PlanPost[];
  volunteers: PlanVolunteer[];
}) {
  const [tab, setTab] = useState<"horaire" | "personne">("horaire");
  const [posts, setPosts] = useState<PlanPost[]>(initialPosts);
  const [volunteers, setVolunteers] = useState<PlanVolunteer[]>(initialVolunteers);
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { setPosts(initialPosts); },    [initialPosts]);
  useEffect(() => { setVolunteers(initialVolunteers); }, [initialVolunteers]);

  // Close picker on outside click
  useEffect(() => {
    if (!openPickerId) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-picker]")) setOpenPickerId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPickerId]);

  // Stats
  const totalAssigned   = volunteers.filter(v => v.assigned_post_ids.length > 0).length;
  const totalUnassigned = volunteers.length - totalAssigned;
  const totalPostsFilled = posts.filter(p => p.assignedVolunteers.length >= p.capacity && p.capacity > 0).length;

  function handleAdd(postId: string, reg_id: string, name: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, assignedVolunteers: [...p.assignedVolunteers, { reg_id, name }] }
        : p
    ));
    setVolunteers(prev => prev.map(v =>
      v.reg_id === reg_id
        ? { ...v, assigned_post_ids: [...v.assigned_post_ids, postId] }
        : v
    ));
    router.refresh();
  }

  function handleRemove(postId: string, reg_id: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, assignedVolunteers: p.assignedVolunteers.filter(v => v.reg_id !== reg_id) }
        : p
    ));
    setVolunteers(prev => prev.map(v =>
      v.reg_id === reg_id
        ? { ...v, assigned_post_ids: v.assigned_post_ids.filter(id => id !== postId) }
        : v
    ));
    router.refresh();
  }

  return (
    <div>
      {/* ── Stats bar ── */}
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

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
          {(["horaire", "personne"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "horaire" ? "Par horaire" : "Par personne"}
            </button>
          ))}
        </div>

        {/* Export */}
        <button
          onClick={() => exportXLSX(posts, volunteers)}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export Excel (horaire + personne)
        </button>
      </div>

      {/* ── Content ── */}
      {tab === "horaire" ? (
        <ByHoraireView
          posts={posts}
          volunteers={volunteers}
          openPickerId={openPickerId}
          setOpenPickerId={setOpenPickerId}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      ) : (
        <ByPersonneView posts={posts} volunteers={volunteers} />
      )}
    </div>
  );
}
