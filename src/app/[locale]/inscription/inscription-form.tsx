"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft, User, Flag, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;
type Category = "hobby" | "sport" | "libre" | "adulte";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  postalCode: string;
  city: string;
  vehicleName: string;
  category: Category | "";
  termsAccepted: boolean;
}

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  postalCode: "",
  city: "",
  vehicleName: "",
  category: "",
  termsAccepted: false,
};

const CATEGORIES: { value: Category; label: string; desc: string }[] = [
  { value: "hobby", label: "Hobby", desc: "Pneus pleins · Nés entre 2012 et 2019" },
  { value: "sport", label: "Sport", desc: "Pneus gonflés · Nés entre 2012 et 2019" },
  { value: "libre", label: "Libre", desc: "Designs alternatifs · Nés entre 2012 et 2019" },
  { value: "adulte", label: "Adultes", desc: "16 ans et plus" },
];

const STEPS = [
  { id: 1, label: "Infos personnelles", icon: User },
  { id: 2, label: "Votre caisse", icon: Flag },
  { id: 3, label: "Confirmation", icon: CreditCard },
] as const;

export default function InscriptionForm() {
  const t = useTranslations("inscription");
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      // Mock submission — stores to Supabase once configured
      // TODO: replace with real Supabase insert when DB is ready
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("success")}</h1>
        <p className="text-gray-500 mb-8">{t("successText")}</p>
        <div className="rounded-xl bg-gray-50 p-6 text-left ring-1 ring-gray-100 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Récapitulatif</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Pilote</dt>
              <dd className="font-medium">{data.firstName} {data.lastName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Caisse</dt>
              <dd className="font-medium">{data.vehicleName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Catégorie</dt>
              <dd className="font-medium capitalize">{data.category}</dd>
            </div>
          </dl>
        </div>
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-3 bg-red-50 text-red-600 border-red-100 hover:bg-red-50">
          42ème Grand-Prix de Versoix
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                    isDone
                      ? "border-red-600 bg-red-600 text-white"
                      : isActive
                      ? "border-red-600 bg-white text-red-600"
                      : "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isActive ? "font-semibold text-red-600" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    step > s.id ? "bg-red-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Personal info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("firstName")} *</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("lastName")} *</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")} *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="votre@email.ch"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+41 79 000 00 00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">{t("birthDate")} *</Label>
              <Input
                id="birthDate"
                type="date"
                value={data.birthDate}
                onChange={(e) => update("birthDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{t("address")}</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{t("postalCode")}</Label>
              <Input
                id="postalCode"
                value={data.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="1290"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="city">{t("city")}</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Versoix"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setStep(2)}
              disabled={!data.firstName || !data.lastName || !data.email || !data.birthDate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vehicleName">{t("vehicleName")} *</Label>
            <Input
              id="vehicleName"
              value={data.vehicleName}
              onChange={(e) => update("vehicleName", e.target.value)}
              placeholder={t("vehicleNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>{t("category")} *</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => update("category", cat.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    data.category === cat.value
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <p
                    className={cn(
                      "font-semibold",
                      data.category === cat.value ? "text-red-700" : "text-gray-900"
                    )}
                  >
                    {cat.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("back")}
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!data.vehicleName || !data.category}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Récapitulatif</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Pilote</dt>
                <dd className="font-medium">{data.firstName} {data.lastName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{data.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Date de naissance</dt>
                <dd className="font-medium">{data.birthDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Caisse</dt>
                <dd className="font-medium">{data.vehicleName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Catégorie</dt>
                <dd className="font-medium capitalize">{data.category}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{t("price")}</p>
              <p className="text-xs text-gray-500">{t("priceNote")}</p>
            </div>
            <span className="font-bold text-lg text-gray-900">25 CHF</span>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={data.termsAccepted}
              onChange={(e) => update("termsAccepted", e.target.checked)}
              className="mt-1 h-4 w-4 accent-red-600"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {t("termsAccept")} (
              <Link href="/course#reglement" className="text-red-600 hover:underline">
                {t("termsLink")}
              </Link>
              )
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("back")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!data.termsAccepted || loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6"
            >
              {loading ? "Inscription en cours..." : t("confirm")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
