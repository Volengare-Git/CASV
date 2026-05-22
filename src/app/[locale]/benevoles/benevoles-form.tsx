"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TaskOption } from "./page";

const TASK_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "si_necessaire", label: "Si nécessaire" },
  { value: "non", label: "Non" },
] as const;

interface Props {
  editionId: string;
  tasks: TaskOption[];
  eventDate: string;
}

export default function BenevolesForm({ editionId, tasks, eventDate }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState<"moins_18" | "18_et_plus" | "">("");
  const [taskInterests, setTaskInterests] = useState<Record<string, string>>({});
  const [wantsMembership, setWantsMembership] = useState<"true" | "false" | "">("");
  const [notes, setNotes] = useState("");

  const allTasksAnswered = tasks.length === 0 || tasks.every((t) => taskInterests[t.id]);
  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    ageGroup !== "" &&
    allTasksAnswered &&
    wantsMembership !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) { setSubmitted(true); return; }
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("volunteer_registrations")
      .insert({
        edition_id: editionId,
        guest_first_name: firstName.trim(),
        guest_last_name: lastName.trim(),
        guest_phone: phone.trim() || null,
        guest_email: email.trim(),
        age_group: ageGroup,
        task_interests: taskInterests,
        wants_membership: wantsMembership === "true",
        notes: notes.trim() || null,
        status: "pending",
        assignment_mode: "auto",
      });

    if (insertError) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Merci pour votre inscription !
        </h1>
        <p className="text-gray-500">
          Nous vous contacterons bientôt pour confirmer votre rôle au sein de
          l&apos;équipe.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Inscription bénévole
        </h1>
        <p className="mt-2 text-gray-500">
          Rejoignez l&apos;équipe de bénévoles du Grand Prix de Versoix.
          {eventDate && <> Rendez-vous le <strong>{eventDate}</strong> !</>}
          {" "}Votre aide est précieuse pour faire de cet événement une réussite !
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Honeypot */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
        >
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Coordonnées */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Coordonnées
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+41 79 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Tranche d'âge */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tranche d&apos;âge *
          </h2>
          <div className="flex flex-wrap gap-5">
            {(
              [
                { value: "moins_18", label: "Moins de 18 ans" },
                { value: "18_et_plus", label: "18 ans et plus" },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="ageGroup"
                  value={opt.value}
                  checked={ageGroup === opt.value}
                  onChange={() => setAgeGroup(opt.value)}
                  className="h-4 w-4 accent-blue-800"
                  required
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Disponibilités par tâche */}
        {tasks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Disponibilités *
            </h2>
            <p className="text-sm text-gray-500">
              Indiquez votre disponibilité pour chacune des tâches ci-dessous.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[220px]">
                      Tâche
                    </th>
                    {TASK_OPTIONS.map((opt) => (
                      <th
                        key={opt.value}
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-500 min-w-[100px]"
                      >
                        {opt.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task, idx) => (
                    <tr key={task.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-sm text-gray-700">{task.label}</td>
                      {TASK_OPTIONS.map((opt) => (
                        <td key={opt.value} className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name={`task_${task.id}`}
                            value={opt.value}
                            checked={taskInterests[task.id] === opt.value}
                            onChange={() =>
                              setTaskInterests((prev) => ({
                                ...prev,
                                [task.id]: opt.value,
                              }))
                            }
                            className="h-4 w-4 accent-blue-800"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!allTasksAnswered && (
              <p className="text-xs text-gray-400">
                Veuillez répondre à chaque tâche pour pouvoir envoyer le formulaire.
              </p>
            )}
          </section>
        )}

        {/* Adhésion */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Adhésion *
          </h2>
          <p className="text-sm text-gray-600">
            Souhaitez-vous devenir membre de l&apos;association CASV ?
          </p>
          <div className="flex gap-5">
            {(
              [
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="wantsMembership"
                  value={opt.value}
                  checked={wantsMembership === opt.value}
                  onChange={() => setWantsMembership(opt.value)}
                  className="h-4 w-4 accent-blue-800"
                  required
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Commentaires */}
        <section className="space-y-1.5">
          <Label htmlFor="notes">Commentaires</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informations complémentaires, contraintes horaires…"
            rows={3}
            className="resize-none"
          />
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-blue-800 hover:bg-blue-900 text-white sm:w-auto"
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? "Envoi en cours…" : "Envoyer mon inscription"}
        </Button>
      </form>
    </div>
  );
}
