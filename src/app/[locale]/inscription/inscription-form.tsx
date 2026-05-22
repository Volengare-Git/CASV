"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ChevronRight, ChevronLeft, User, Flag, CreditCard } from "lucide-react";
import { cn, ageAtDate } from "@/lib/utils";

export interface CategoryOption {
  value: string;
  label: string;
  desc: string;
  min_age: number | null;
  max_age: number | null;
}

interface Profile {
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
}

interface Props {
  editionId: string;
  editionName: string;
  priceChf: number;
  userId: string;
  userEmail: string;
  profile: Profile | null;
  categories: CategoryOption[];
  eventDate: string;       // "2 mai 2027" (short)
  eventYear: number;       // 2027
  eventDateIso: string;    // "2027-05-02" for exact age check
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  address: string;
  postalCode: string;
  city: string;
  vehicleName: string;
  category: string;
  termsAccepted: boolean;
}

type Step = 1 | 2 | 3;

export default function InscriptionForm({ editionId, editionName, priceChf, userId, userEmail, profile, categories, eventDate, eventYear, eventDateIso }: Props) {
  const t = useTranslations("inscription");
  const [step, setStep] = useState<Step>(1);

  const STEPS = [
    { id: 1 as Step, label: t("step1"), icon: User },
    { id: 2 as Step, label: t("step2"), icon: Flag },
    { id: 3 as Step, label: t("step3"), icon: CreditCard },
  ];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<FormData>({
    firstName:   profile?.first_name ?? "",
    lastName:    profile?.last_name  ?? "",
    phone:       profile?.phone       ?? "",
    birthDate:   profile?.birth_date  ?? "",
    address:     profile?.address     ?? "",
    postalCode:  profile?.postal_code ?? "",
    city:        profile?.city        ?? "",
    vehicleName: "",
    category:    "",
    termsAccepted: false,
  });

  const selectedCat    = categories.find((c) => c.value === data.category);
  const categoryLabel  = selectedCat?.label ?? data.category;

  // Age validation — checked when both category and birth date are filled
  const ageError: string | null = (() => {
    if (!data.category || !data.birthDate || !selectedCat) return null;
    const birth     = new Date(data.birthDate);
    const raceDay   = new Date(eventDateIso + "T12:00:00");
    if (isNaN(birth.getTime())) return null;
    const age       = ageAtDate(birth, raceDay);
    const { min_age, max_age } = selectedCat;
    if (min_age !== null && age < min_age) {
      return `Trop jeune pour cette catégorie (minimum ${min_age} ans révolus le jour de la course, vous en aurez ${age}).`;
    }
    if (max_age !== null && age > max_age) {
      return `Trop âgé pour cette catégorie (maximum ${max_age} ans, vous en aurez ${age}). Essayez la catégorie Adultes.`;
    }
    return null;
  })();

  /** Compute "Nés de {maxYear} à {minYear}" for a category */
  function birthYearRange(cat: CategoryOption): string | null {
    if (cat.min_age === null) return null;
    const maxYear = eventYear - cat.min_age; // youngest (most recent)
    if (cat.max_age === null) return `Nés en ${maxYear} et avant`;
    const minYear = eventYear - cat.max_age; // oldest (furthest back)
    return `Nés de ${maxYear} à ${minYear}`;
  }

  function update(field: keyof FormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    await supabase.from("profiles").update({
      first_name:  data.firstName,
      last_name:   data.lastName,
      phone:       data.phone       || null,
      birth_date:  data.birthDate   || null,
      address:     data.address     || null,
      postal_code: data.postalCode  || null,
      city:        data.city        || null,
    }).eq("id", userId);

    const { error: regError } = await supabase.from("registrations").insert({
      user_id:        userId,
      edition_id:     editionId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category:       data.category as any,
      vehicle_name:   data.vehicleName,
      payment_status: "paid",
      payment_method: "mock",
    });

    if (regError) {
      setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("success")}</h1>
        <p className="text-gray-500 mb-8">{t("successText")}</p>
        <div className="rounded-xl bg-gray-50 p-6 text-left ring-1 ring-gray-100 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Récapitulatif</p>
          <dl className="space-y-1.5 text-sm">
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
              <dd className="font-medium">{categoryLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Statut paiement</dt>
              <dd className="font-medium text-green-600">Confirmé</dd>
            </div>
          </dl>
        </div>
        <Link href="/compte">
          <Button className="bg-blue-800 hover:bg-blue-900 text-white">Mon espace participant</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Badge className="mb-3 bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-50">
          {editionName}
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-gray-500">{editionName}{eventDate && ` · ${eventDate}`}</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isDone    ? "border-blue-800 bg-blue-800 text-white"
                  : isActive ? "border-blue-800 bg-white text-blue-800"
                  : "border-gray-200 bg-white text-gray-400"
                )}>
                  {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  "hidden text-xs sm:block",
                  isActive ? "font-semibold text-blue-800" : "text-gray-400"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", step > s.id ? "bg-blue-800" : "bg-gray-200")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Étape 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("firstName")} *</Label>
              <Input id="firstName" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("lastName")} *</Label>
              <Input id="lastName" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={userEmail} disabled className="bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400">L&apos;email est lié à votre compte et ne peut pas être modifié ici.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+41 79 000 00 00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">{t("birthDate")} *</Label>
              <Input id="birthDate" type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" value={data.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{t("postalCode")}</Label>
              <Input id="postalCode" value={data.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="1290" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="Versoix" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)} disabled={!data.firstName || !data.lastName || !data.birthDate} className="bg-blue-800 hover:bg-blue-900 text-white">
              {t("next")} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vehicleName">{t("vehicleName")} *</Label>
            <Input id="vehicleName" value={data.vehicleName} onChange={(e) => update("vehicleName", e.target.value)} placeholder={t("vehicleNamePlaceholder")} required />
          </div>
          <div className="space-y-3">
            <Label>{t("category")} *</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((cat) => {
                const range = birthYearRange(cat);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update("category", cat.value)}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-all",
                      data.category === cat.value
                        ? "border-blue-800 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <p className={cn("font-semibold", data.category === cat.value ? "text-blue-900" : "text-gray-900")}>
                      {cat.label}
                    </p>
                    {cat.desc && <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>}
                    {range && (
                      <p className={cn(
                        "text-xs font-medium mt-1",
                        data.category === cat.value ? "text-blue-700" : "text-gray-400"
                      )}>
                        {range}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {ageError && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{ageError}</span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("back")}
            </Button>
            <Button onClick={() => setStep(3)} disabled={!data.vehicleName || !data.category || !!ageError} className="bg-blue-800 hover:bg-blue-900 text-white">
              {t("next")} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Récapitulatif</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Pilote</dt><dd className="font-medium">{data.firstName} {data.lastName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{userEmail}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Date de naissance</dt><dd className="font-medium">{data.birthDate}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Caisse</dt><dd className="font-medium">{data.vehicleName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Catégorie</dt><dd className="font-medium">{categoryLabel}</dd></div>
            </dl>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{t("price")}</p>
              <p className="text-xs text-gray-500">{t("priceNote")}</p>
            </div>
            <span className="font-bold text-lg text-gray-900">{priceChf} CHF</span>
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={data.termsAccepted}
              onChange={(e) => update("termsAccepted", e.target.checked)}
              className="mt-1 h-4 w-4 accent-blue-800"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {t("termsAccept")} (
              <Link href="/course#reglement" className="text-blue-800 hover:underline">
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
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("back")}
            </Button>
            <Button onClick={handleSubmit} disabled={!data.termsAccepted || loading} className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6">
              {loading ? "Inscription en cours..." : t("confirm")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
