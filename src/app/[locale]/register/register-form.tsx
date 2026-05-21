"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const passwordConfirm = form.get("passwordConfirm") as string;
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });
      if (signUpError) throw signUpError;

      // Si la confirmation email est activée dans Supabase, identities est vide
      // et l'utilisateur doit vérifier son email avant de se connecter
      if (!data.session) {
        setConfirmEmail(email);
        setLoading(false);
        return;
      }

      // Confirmation désactivée : session immédiate, on redirige
      router.push("/compte");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte");
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
            <Flag className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-gray-500 mb-1">
            Un lien de confirmation a été envoyé à
          </p>
          <p className="font-medium text-gray-900 mb-4">{confirmEmail}</p>
          <p className="text-xs text-gray-400">
            Cliquez sur le lien dans l&apos;email pour activer votre compte, puis connectez-vous.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
            <Flag className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("register")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("registerSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("firstName")}</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("lastName")}</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="votre@email.ch"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirm">{t("passwordConfirm")}</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Création..." : t("registerBtn")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-red-600 hover:underline"
          >
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
