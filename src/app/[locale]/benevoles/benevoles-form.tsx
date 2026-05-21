"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Send, Users, Clock } from "lucide-react";

// Placeholder posts — will come from Supabase once the DB is ready
const POSTS = [
  { id: "securite", name: "Sécurité du parcours", time: "7h00–17h00", capacity: 10 },
  { id: "dossards", name: "Remise des dossards", time: "8h30–10h00", capacity: 4 },
  { id: "technique", name: "Contrôle technique", time: "8h00–10h00", capacity: 3 },
  { id: "depart", name: "Gestion du départ", time: "10h00–16h00", capacity: 4 },
  { id: "chronometrage", name: "Chronométrage", time: "10h00–16h00", capacity: 2 },
  { id: "restauration", name: "Restauration", time: "11h00–15h00", capacity: 8 },
  { id: "podium", name: "Cérémonie & podium", time: "16h30–18h00", capacity: 3 },
  { id: "logistique", name: "Logistique générale", time: "7h00–18h00", capacity: 5 },
];

export default function BenevolesForm() {
  const t = useTranslations("volunteers");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<string[]>(["", "", ""]);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });

  function setField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function setPref(index: number, value: string | null) {
    setPrefs((prev) => {
      const next = [...prev];
      next[index] = value ?? "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: save to Supabase volunteer_registrations
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("success")}</h1>
        <p className="text-gray-500">{t("successText")}</p>
      </div>
    );
  }

  const availablePosts = (excludeIndexes: number[]) =>
    POSTS.filter(
      (p) => !excludeIndexes.map((i) => prefs[i]).filter(Boolean).includes(p.id)
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Badge className="mb-3 bg-red-50 text-red-600 border-red-100 hover:bg-red-50">
          42ème Grand-Prix de Versoix
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500">{t("intro")}</p>
      </div>

      {/* Postes disponibles */}
      <div className="mb-8 rounded-xl bg-gray-50 p-5 ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-red-600" />
          <h2 className="font-semibold text-gray-900">{t("postsTitle")}</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {POSTS.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{post.name}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {post.time}
                </p>
              </div>
              <span className="text-xs text-gray-400">{post.capacity} places</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <Label>{t("preferences")}</Label>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-gray-400">
                {i === 0 ? t("preference1") : i === 1 ? t("preference2") : t("preference3")}
              </p>
              <Select value={prefs[i] ?? ""} onValueChange={(v: string | null) => setPref(i, v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("noPref")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("noPref")}</SelectItem>
                  {availablePosts([0, 1, 2].filter((idx) => idx !== i)).map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.name} · {post.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={!formData.firstName || !formData.lastName || !formData.email || loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white sm:w-auto"
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? "Envoi..." : t("confirm")}
        </Button>
      </form>
    </div>
  );
}
