"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
          {error.digest && (
            <span className="block mt-2 text-xs text-gray-400 font-mono">
              Réf : {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
