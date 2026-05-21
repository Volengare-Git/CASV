"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, Check, X } from "lucide-react";
import { createTask, updateTask, deleteTask, reorderTasks } from "../actions";
import type { VolunteerTask } from "./page";

export default function TachesManager({
  tasks: initialTasks,
  editionId,
}: {
  tasks: VolunteerTask[];
  editionId: string;
}) {
  const [tasks, setTasks] = useState<VolunteerTask[]>(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // Sync local state when server re-renders with new data (after add/revalidate)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  const [editValue, setEditValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Edit ---
  function startEdit(task: VolunteerTask) {
    setEditingId(task.id);
    setEditValue(task.label);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  function saveEdit(taskId: string) {
    if (!editValue.trim()) return;
    const prev = tasks;
    setTasks((t) => t.map((task) => (task.id === taskId ? { ...task, label: editValue.trim() } : task)));
    setEditingId(null);
    startTransition(async () => {
      try {
        await updateTask(taskId, editValue.trim());
        toast.success("Tâche mise à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
        setTasks(prev);
      }
    });
  }

  // --- Delete ---
  function handleDelete(taskId: string) {
    if (!confirm("Supprimer cette tâche ? Les inscriptions existantes ne seront pas affectées.")) return;
    const prev = tasks;
    setTasks((t) => t.filter((task) => task.id !== taskId));
    startTransition(async () => {
      try {
        await deleteTask(taskId);
        toast.success("Tâche supprimée");
      } catch {
        toast.error("Erreur lors de la suppression");
        setTasks(prev);
      }
    });
  }

  // --- Add ---
  function handleAdd() {
    if (!newLabel.trim()) return;
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.display_order)) : 0;
    startTransition(async () => {
      try {
        await createTask(editionId, newLabel.trim(), maxOrder + 1);
        toast.success("Tâche ajoutée");
        setNewLabel("");
        setShowAdd(false);
        router.refresh(); // triggers Server Component re-render → updates initialTasks
      } catch {
        toast.error("Erreur lors de l'ajout");
      }
    });
  }

  // --- Drag & drop reorder ---
  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const from = tasks.findIndex((t) => t.id === draggedId);
    const to = tasks.findIndex((t) => t.id === targetId);
    if (from === -1 || to === -1) return;

    const next = [...tasks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const reordered = next.map((t, i) => ({ ...t, display_order: i + 1 }));

    setTasks(reordered);
    setDraggedId(null);
    setDragOverId(null);

    startTransition(async () => {
      try {
        await reorderTasks(reordered.map((t) => t.id));
        toast.success("Ordre mis à jour");
      } catch {
        toast.error("Erreur lors du réordonnancement");
        setTasks(initialTasks);
      }
    });
  }

  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {tasks.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            Aucune tâche définie. Ajoutez-en une ci-dessous.
          </p>
        )}

        <ul className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDrop={() => handleDrop(task.id)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                dragOverId === task.id ? "bg-blue-50" : "hover:bg-gray-50"
              } ${draggedId === task.id ? "opacity-40" : ""}`}
            >
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab flex-shrink-0" />

              {/* Order number */}
              <span className="text-xs font-mono text-gray-300 w-5 flex-shrink-0">
                {task.display_order}
              </span>

              {/* Label / edit input */}
              {editingId === task.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(task.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 rounded border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="rounded p-1 text-green-600 hover:bg-green-50"
                    title="Enregistrer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100"
                    title="Annuler"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-800">{task.label}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity [li:hover_&]:opacity-100">
                    <button
                      onClick={() => startEdit(task)}
                      disabled={isPending}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      disabled={isPending}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Add new task */}
        {showAdd ? (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setShowAdd(false); setNewLabel(""); }
              }}
              placeholder="Nom de la tâche…"
              className="flex-1 rounded border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim() || isPending}
              className="rounded bg-blue-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-900 disabled:opacity-50"
            >
              Ajouter
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewLabel(""); }}
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
              Ajouter une tâche
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Glissez-déposez les tâches pour les réordonner. Les modifications sont visibles immédiatement dans le formulaire public.
      </p>
    </div>
  );
}
