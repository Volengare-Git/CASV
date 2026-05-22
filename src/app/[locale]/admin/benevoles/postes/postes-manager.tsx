"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, Check, X } from "lucide-react";
import { createPost, updatePost, deletePost, reorderPosts } from "./actions";
import type { VolunteerPost } from "./page";

type EditState = {
  name: string;
  order_code: string;
  time_label: string;
  end_time: string;
  capacity: string;
};

function emptyEdit(p?: VolunteerPost): EditState {
  return {
    name: p?.name ?? "",
    order_code: p?.order_code?.toString() ?? "",
    time_label: p?.time_label ?? "",
    end_time: p?.end_time ?? "",
    capacity: p?.capacity?.toString() ?? "1",
  };
}

function parseEdit(e: EditState) {
  return {
    name: e.name.trim(),
    order_code: e.order_code ? parseInt(e.order_code, 10) || null : null,
    time_label: e.time_label.trim() || null,
    end_time: e.end_time.trim() || null,
    capacity: parseInt(e.capacity, 10) || 1,
  };
}

export default function PostesManager({
  posts: initialPosts,
  editionId,
}: {
  posts: VolunteerPost[];
  editionId: string;
}) {
  const [posts, setPosts] = useState<VolunteerPost[]>(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>(emptyEdit());
  const [showAdd, setShowAdd] = useState(false);
  const [newState, setNewState] = useState<EditState>(emptyEdit());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPosts(initialPosts); }, [initialPosts]);
  useEffect(() => { if (showAdd) addNameRef.current?.focus(); }, [showAdd]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  function startEdit(post: VolunteerPost) {
    setEditingId(post.id);
    setEditState(emptyEdit(post));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(emptyEdit());
  }

  function saveEdit(id: string) {
    const data = parseEdit(editState);
    if (!data.name) return;
    const prev = posts;
    setPosts(p => p.map(post => post.id === id ? { ...post, ...data } : post));
    setEditingId(null);
    startTransition(async () => {
      try {
        await updatePost(id, data);
        toast.success("Poste mis à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
        setPosts(prev);
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    if (!confirm("Supprimer ce poste ? Les assignations existantes seront perdues.")) return;
    const prev = posts;
    setPosts(p => p.filter(post => post.id !== id));
    startTransition(async () => {
      try {
        await deletePost(id);
        toast.success("Poste supprimé");
      } catch {
        toast.error("Erreur lors de la suppression");
        setPosts(prev);
      }
    });
  }

  // ── Add ───────────────────────────────────────────────────────────────────
  function handleAdd() {
    const data = parseEdit(newState);
    if (!data.name) return;
    const maxOrder = posts.length > 0 ? Math.max(...posts.map(p => p.display_order)) : 0;
    startTransition(async () => {
      try {
        await createPost(editionId, data, maxOrder + 1);
        toast.success("Poste ajouté");
        setNewState(emptyEdit());
        setShowAdd(false);
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'ajout");
      }
    });
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null); setDragOverId(null); return;
    }
    const from = posts.findIndex(p => p.id === draggedId);
    const to   = posts.findIndex(p => p.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...posts];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const reordered = next.map((p, i) => ({ ...p, display_order: i + 1 }));
    setPosts(reordered);
    setDraggedId(null); setDragOverId(null);
    startTransition(async () => {
      try {
        await reorderPosts(reordered.map(p => p.id));
        toast.success("Ordre mis à jour");
      } catch {
        toast.error("Erreur de réordonnancement");
        setPosts(initialPosts);
      }
    });
  }

  // ── Shared field render helpers ───────────────────────────────────────────
  function FieldInput({ value, onChange, placeholder, className = "" }: {
    value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
  }) {
    return (
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      />
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex gap-4 text-xs text-gray-400">
        <span className="w-12 text-right">#</span>
        <span className="w-32">De (heure / jour)</span>
        <span className="w-20">À</span>
        <span className="flex-1">Description du poste</span>
        <span className="w-14 text-center">Cap.</span>
        <span className="w-16" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            Aucun poste défini. Ajoutez-en un ci-dessous.
          </p>
        )}

        <ul className="divide-y divide-gray-100">
          {posts.map(post => (
            <li
              key={post.id}
              draggable
              onDragStart={() => setDraggedId(post.id)}
              onDragOver={e => { e.preventDefault(); setDragOverId(post.id); }}
              onDrop={() => handleDrop(post.id)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                dragOverId === post.id ? "bg-blue-50" : "hover:bg-gray-50/60"
              } ${draggedId === post.id ? "opacity-40" : ""}`}
            >
              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />

              {editingId === post.id ? (
                /* ── edit row ── */
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <FieldInput
                    value={editState.order_code}
                    onChange={v => setEditState(s => ({ ...s, order_code: v }))}
                    placeholder="N°"
                    className="w-14"
                  />
                  <FieldInput
                    value={editState.time_label}
                    onChange={v => setEditState(s => ({ ...s, time_label: v }))}
                    placeholder="07h00 / jeudi avant…"
                    className="w-36"
                  />
                  <FieldInput
                    value={editState.end_time}
                    onChange={v => setEditState(s => ({ ...s, end_time: v }))}
                    placeholder="17h00"
                    className="w-20"
                  />
                  <FieldInput
                    value={editState.name}
                    onChange={v => setEditState(s => ({ ...s, name: v }))}
                    placeholder="Description du poste"
                    className="flex-1 min-w-[160px]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Cap.</span>
                    <FieldInput
                      value={editState.capacity}
                      onChange={v => setEditState(s => ({ ...s, capacity: v }))}
                      className="w-14"
                    />
                  </div>
                  <button onClick={() => saveEdit(post.id)} className="rounded p-1 text-green-600 hover:bg-green-50">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={cancelEdit} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* ── display row ── */
                <>
                  <span className="w-12 text-right text-xs font-mono text-gray-300 shrink-0">
                    {post.order_code ?? "—"}
                  </span>
                  <span className="w-32 text-xs text-gray-500 truncate shrink-0">
                    {post.time_label ?? "—"}
                  </span>
                  <span className="w-20 text-xs text-gray-400 truncate shrink-0">
                    {post.end_time ?? "—"}
                  </span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{post.name}</span>
                  <span className="w-14 text-center text-xs font-medium text-gray-500 shrink-0">
                    {post.capacity}
                  </span>
                  <div className="flex gap-1 w-16 justify-end shrink-0 opacity-0 [li:hover_&]:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(post)}
                      disabled={isPending}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={isPending}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* ── Add row ── */}
        {showAdd ? (
          <div className="border-t border-gray-100 px-3 py-2.5 flex flex-wrap items-center gap-2 bg-blue-50/40">
            <input
              ref={addNameRef}
              value={newState.order_code}
              onChange={e => setNewState(s => ({ ...s, order_code: e.target.value }))}
              placeholder="N°"
              className="w-14 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={newState.time_label}
              onChange={e => setNewState(s => ({ ...s, time_label: e.target.value }))}
              placeholder="07h00 / jeudi avant…"
              className="w-36 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={newState.end_time}
              onChange={e => setNewState(s => ({ ...s, end_time: e.target.value }))}
              placeholder="17h00"
              className="w-20 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={newState.name}
              onChange={e => setNewState(s => ({ ...s, name: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setShowAdd(false); setNewState(emptyEdit()); }}}
              placeholder="Description du poste *"
              className="flex-1 min-w-[160px] rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Cap.</span>
              <input
                value={newState.capacity}
                onChange={e => setNewState(s => ({ ...s, capacity: e.target.value }))}
                className="w-14 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newState.name.trim() || isPending}
              className="rounded bg-blue-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-900 disabled:opacity-50"
            >
              Ajouter
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewState(emptyEdit()); }}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100 px-4 py-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-800 transition-colors py-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter un poste
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Glissez-déposez pour réordonner · <strong>De</strong> = heure de début ou jour descriptif (ex : &quot;07h00&quot;, &quot;jeudi avant&quot;) · <strong>À</strong> = heure de fin (optionnel) · <strong>Cap.</strong> = nombre de bénévoles nécessaires
      </p>
    </div>
  );
}
