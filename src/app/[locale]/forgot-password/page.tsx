"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flag, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError("Une erreur est survenue. Vérifiez l'adresse email et réessayez.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
            <Flag className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Email envoyé</h1>
          <p className="text-sm text-gray-500 mb-1">Un lien de réinitialisation a été envoyé à</p>
          <p className="font-medium text-gray-900 mb-4">{email}</p>
          <p className="text-xs text-gray-400 mb-6">
            Le lien est valable 1 heure. Vérifiez aussi vos spams.
          </p>
          <Link href="/login" className="text-sm text-red-600 hover:underline font-medium">
            Retour à la connexion
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-gray-500">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.ch"
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
