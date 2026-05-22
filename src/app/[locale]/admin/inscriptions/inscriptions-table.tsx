"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import type { RegistrationRow, CategoryAgeRule } from "./page";
import type { Category, PaymentStatus } from "@/lib/supabase/types";
import { validatePayment, cancelRegistration, assignDossard } from "../actions";
import { ageAtDate } from "@/lib/utils";

const CATEGORY_LABELS: Record<Category, string> = {
  hobby: "Hobby",
  sport: "Sport",
  libre: "Libre",
  adulte: "Adultes",
};

const STATUS_STYLES: Record<PaymentStatus, { label: string; class: string }> = {
  paid: { label: "Payé", class: "bg-green-100 text-green-800" },
  pending: { label: "En attente", class: "bg-amber-100 text-amber-800" },
  refunded: { label: "Remboursé", class: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulé", class: "bg-red-100 text-red-700" },
};

const ALL_CATEGORIES: Category[] = ["hobby", "sport", "libre", "adulte"];
const ALL_STATUSES: PaymentStatus[] = ["paid", "pending", "cancelled", "refunded"];

function downloadCSV(rows: RegistrationRow[]) {
  const headers = [
    "Nom", "Prénom", "Téléphone", "Catégorie", "Caisse",
    "Statut paiement", "Méthode", "Dossard", "Date inscription",
  ];
  const data = rows.map((r) => [
    r.profiles?.last_name ?? "",
    r.profiles?.first_name ?? "",
    r.profiles?.phone ?? "",
    CATEGORY_LABELS[r.category],
    r.vehicle_name,
    STATUS_STYLES[r.payment_status].label,
    r.payment_method,
    r.dossard_number?.toString() ?? "",
    new Date(r.created_at).toLocaleDateString("fr-CH"),
  ]);
  const csv = [headers, ...data]
    .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inscriptions-casv-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function checkAgeValidity(
  reg: RegistrationRow,
  eventDateIso: string,
  ageRules: CategoryAgeRule[]
): { valid: boolean; message: string } | null {
  const birthDate = reg.profiles?.birth_date;
  if (!birthDate || !eventDateIso) return null;
  const rule = ageRules.find((r) => r.value === reg.category);
  if (!rule || (rule.min_age === null && rule.max_age === null)) return null;
  const birth   = new Date(birthDate);
  const raceDay = new Date(eventDateIso + "T12:00:00");
  const age     = ageAtDate(birth, raceDay);
  if (rule.min_age !== null && age < rule.min_age) {
    return { valid: false, message: `Trop jeune : ${age} ans (min. ${rule.min_age})` };
  }
  if (rule.max_age !== null && age > rule.max_age) {
    return { valid: false, message: `Trop âgé : ${age} ans (max. ${rule.max_age})` };
  }
  return { valid: true, message: `${age} ans ✓` };
}

export default function InscriptionsTable({
  registrations,
  eventDateIso,
  ageRules,
}: {
  registrations: RegistrationRow[];
  eventDateIso: string;
  ageRules: CategoryAgeRule[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [editingDossard, setEditingDossard] = useState<string | null>(null);
  const [dossardValue, setDossardValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = registrations.filter((r) => {
    const name = `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""} ${r.vehicle_name}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (statusFilter !== "all" && r.payment_status !== statusFilter) return false;
    return true;
  });

  function handleValidate(id: string) {
    startTransition(async () => {
      try {
        await validatePayment(id);
        toast.success("Paiement validé");
      } catch {
        toast.error("Erreur lors de la validation");
      }
    });
  }

  function handleCancel(id: string) {
    if (!confirm("Annuler cette inscription ?")) return;
    startTransition(async () => {
      try {
        await cancelRegistration(id);
        toast.success("Inscription annulée");
      } catch {
        toast.error("Erreur lors de l'annulation");
      }
    });
  }

  function startEditDossard(id: string, current: number | null) {
    setEditingDossard(id);
    setDossardValue(current?.toString() ?? "");
  }

  function handleSaveDossard(id: string) {
    const num = dossardValue === "" ? null : parseInt(dossardValue, 10);
    if (dossardValue !== "" && isNaN(num!)) {
      toast.error("Numéro de dossard invalide");
      return;
    }
    startTransition(async () => {
      try {
        await assignDossard(id, num);
        toast.success("Dossard mis à jour");
        setEditingDossard(null);
      } catch {
        toast.error("Erreur lors de l'attribution");
      }
    });
  }

  const counts = {
    total: registrations.length,
    paid: registrations.filter((r) => r.payment_status === "paid").length,
    pending: registrations.filter((r) => r.payment_status === "pending").length,
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm text-gray-600">
        <span><strong className="text-gray-900">{counts.total}</strong> inscrits</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-green-700">{counts.paid}</strong> payés</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-amber-700">{counts.pending}</strong> en attente</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Rechercher nom, caisse…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-56"
        />

        <div className="flex gap-1">
          <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
            Tous
          </FilterChip>
          {ALL_CATEGORIES.map((c) => (
            <FilterChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
              {CATEGORY_LABELS[c]}
            </FilterChip>
          ))}
        </div>

        <div className="flex gap-1">
          {ALL_STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            >
              {STATUS_STYLES[s].label}
            </FilterChip>
          ))}
        </div>

        <button
          onClick={() => downloadCSV(filtered)}
          className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Exporter CSV ({filtered.length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <Th>Pilote</Th>
              <Th>Catégorie</Th>
              <Th>Caisse</Th>
              <Th>Âge</Th>
              <Th>Statut</Th>
              <Th>Dossard</Th>
              <Th>Inscrit le</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  Aucune inscription trouvée
                </td>
              </tr>
            )}
            {filtered.map((reg) => {
              const status = STATUS_STYLES[reg.payment_status];
              const isEditingThisDossard = editingDossard === reg.id;
              const ageCheck = checkAgeValidity(reg, eventDateIso, ageRules);
              return (
                <tr key={reg.id} className={`hover:bg-gray-50 transition-colors ${ageCheck && !ageCheck.valid ? "bg-amber-50/40" : ""}`}>
                  <Td>
                    <div className="font-medium text-gray-900">
                      {reg.profiles?.last_name ?? "—"} {reg.profiles?.first_name ?? ""}
                    </div>
                    {reg.profiles?.phone && (
                      <div className="text-xs text-gray-400 mt-0.5">{reg.profiles.phone}</div>
                    )}
                    {reg.profiles?.birth_date && (
                      <div className="text-xs text-gray-300 mt-0.5">{reg.profiles.birth_date}</div>
                    )}
                  </Td>
                  <Td>{CATEGORY_LABELS[reg.category] ?? reg.category}</Td>
                  <Td>{reg.vehicle_name}</Td>
                  <Td>
                    {ageCheck ? (
                      ageCheck.valid ? (
                        <span className="text-xs text-gray-400">{ageCheck.message}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {ageCheck.message}
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </Td>
                  <Td>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.class}`}>
                      {status.label}
                    </span>
                  </Td>
                  <Td>
                    {isEditingThisDossard ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={dossardValue}
                          onChange={(e) => setDossardValue(e.target.value)}
                          placeholder="N°"
                          min={1}
                          className="w-16 rounded border border-gray-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveDossard(reg.id);
                            if (e.key === "Escape") setEditingDossard(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveDossard(reg.id)}
                          disabled={isPending}
                          className="text-xs text-green-700 hover:underline font-medium"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditingDossard(null)}
                          className="text-xs text-gray-400 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditDossard(reg.id, reg.dossard_number)}
                        className="group flex items-center gap-1"
                      >
                        {reg.dossard_number != null ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-white">
                            {reg.dossard_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs group-hover:text-gray-700">
                            — attribuer
                          </span>
                        )}
                      </button>
                    )}
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-400">
                      {new Date(reg.created_at).toLocaleDateString("fr-CH")}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {reg.payment_status === "pending" && (
                        <button
                          onClick={() => handleValidate(reg.id)}
                          disabled={isPending}
                          className="rounded px-2 py-0.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Valider
                        </button>
                      )}
                      {(reg.payment_status === "pending" || reg.payment_status === "paid") && (
                        <button
                          onClick={() => handleCancel(reg.id)}
                          disabled={isPending}
                          className="rounded px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-blue-800 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
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
