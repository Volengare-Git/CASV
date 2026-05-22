"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, GripVertical, Check, X, Eye, EyeOff } from "lucide-react";
import { updateCategory, toggleCategory, reorderCategories, updateAgeRange } from "./actions";
import type { CategoryRow } from "./page";

export default function CategoriesManager({
  categories: initialCategories,
  editionId: _editionId,
}: {
  categories: CategoryRow[];
  editionId: string;
}) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMinAge, setEditMinAge] = useState<string>("");
  const [editMaxAge, setEditMaxAge] = useState<string>("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // --- Edit ---
  function startEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditDesc(cat.description);
    setEditMinAge(cat.min_age?.toString() ?? "");
    setEditMaxAge(cat.max_age?.toString() ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
    setEditDesc("");
    setEditMinAge("");
    setEditMaxAge("");
  }

  function saveEdit(id: string) {
    if (!editLabel.trim()) return;
    const minAge = editMinAge === "" ? null : parseInt(editMinAge, 10);
    const maxAge = editMaxAge === "" ? null : parseInt(editMaxAge, 10);
    const prev = categories;
    setCategories((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, label: editLabel.trim(), description: editDesc.trim(), min_age: minAge, max_age: maxAge }
          : c
      )
    );
    setEditingId(null);
    startTransition(async () => {
      try {
        await updateCategory(id, editLabel.trim(), editDesc.trim());
        await updateAgeRange(id, minAge, maxAge);
        toast.success("Catégorie mise à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
        setCategories(prev);
      }
    });
  }

  // --- Toggle active ---
  function handleToggle(id: string, current: boolean) {
    const prev = categories;
    setCategories((cs) =>
      cs.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
    startTransition(async () => {
      try {
        await toggleCategory(id, !current);
        toast.success(!current ? "Catégorie activée" : "Catégorie masquée");
      } catch {
        toast.error("Erreur lors de la mise à jour");
        setCategories(prev);
      }
    });
  }

  // --- Drag & drop ---
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
    const from = categories.findIndex((c) => c.id === draggedId);
    const to = categories.findIndex((c) => c.id === targetId);
    if (from === -1 || to === -1) return;

    const next = [...categories];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const reordered = next.map((c, i) => ({ ...c, display_order: i + 1 }));

    setCategories(reordered);
    setDraggedId(null);
    setDragOverId(null);

    startTransition(async () => {
      try {
        await reorderCategories(reordered.map((c) => c.id));
        toast.success("Ordre mis à jour");
        router.refresh();
      } catch {
        toast.error("Erreur lors du réordonnancement");
        setCategories(initialCategories);
      }
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <li
              key={cat.id}
              draggable
              onDragStart={() => handleDragStart(cat.id)}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDrop={() => handleDrop(cat.id)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                dragOverId === cat.id ? "bg-blue-50" : "hover:bg-gray-50"
              } ${draggedId === cat.id ? "opacity-40" : ""}`}
            >
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab flex-shrink-0 mt-1" />

              {/* Order number */}
              <span className="text-xs font-mono text-gray-300 w-5 flex-shrink-0 mt-1">
                {cat.display_order}
              </span>

              {/* Content or edit */}
              {editingId === cat.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
                    placeholder="Nom de la catégorie"
                    className="w-full rounded border border-blue-300 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    placeholder="Description (ex: Pneus pleins · Roues standard)"
                    className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Âge min</span>
                    <input
                      type="number"
                      value={editMinAge}
                      onChange={(e) => setEditMinAge(e.target.value)}
                      placeholder="—"
                      min={1}
                      max={99}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">Âge max</span>
                    <input
                      type="number"
                      value={editMaxAge}
                      onChange={(e) => setEditMaxAge(e.target.value)}
                      placeholder="—"
                      min={1}
                      max={99}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-300">(vide = pas de limite)</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(cat.id)}
                      disabled={!editLabel.trim()}
                      className="rounded px-2 py-1 text-xs bg-blue-800 text-white hover:bg-blue-900 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`flex-1 min-w-0 ${!cat.is_active ? "opacity-40" : ""}`}>
                    <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                    {(cat.min_age !== null || cat.max_age !== null) && (
                      <p className="text-xs text-blue-500 mt-0.5">
                        {cat.min_age !== null && cat.max_age !== null && `${cat.min_age}–${cat.max_age} ans`}
                        {cat.min_age !== null && cat.max_age === null && `${cat.min_age} ans et plus`}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5 font-mono">{cat.value}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(cat.id, cat.is_active)}
                      disabled={isPending}
                      className={`rounded p-1.5 transition-colors ${
                        cat.is_active
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-300 hover:bg-gray-100"
                      }`}
                      title={cat.is_active ? "Masquer du formulaire" : "Afficher dans le formulaire"}
                    >
                      {cat.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(cat)}
                      disabled={isPending}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        Glissez pour réordonner · L'œil masque/affiche une catégorie dans le formulaire public · Le slug (en gris) est fixe.
      </p>
    </div>
  );
}
