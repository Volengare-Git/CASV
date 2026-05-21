import type { Metadata } from "next";

export const metadata: Metadata = { title: "Résultats" };

export default function ResultatsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
        Résultats
      </h1>
      <p className="text-gray-500 mb-10">
        Classements des éditions du Grand-Prix de Versoix.
      </p>

      <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
        <p className="text-gray-400 text-sm">
          Les résultats 2027 seront publiés après la course.
        </p>
      </div>
    </div>
  );
}
