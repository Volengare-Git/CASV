import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("gallery") };
}

export default function GaleriePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
        Galerie
      </h1>
      <p className="text-gray-500 mb-10">
        Photos des éditions précédentes du Grand-Prix de Versoix.
      </p>

      {/* Placeholder — photos uploadables depuis l'admin */}
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
        <p className="text-gray-400 text-sm">
          Les photos seront disponibles ici après chaque édition.
        </p>
      </div>
    </div>
  );
}
