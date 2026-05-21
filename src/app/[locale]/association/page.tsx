import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("association");
  return { title: t("title") };
}

export default function AssociationPage() {
  const t = useTranslations("association");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8">
        {t("title")}
      </h1>

      <div className="prose prose-gray max-w-none">
        <h2>{t("history")}</h2>
        <p>{t("historyText")}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">{t("committee")}</h3>
          <p className="text-sm text-gray-500">
            Informations sur le comité disponibles prochainement.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">{t("rental")}</h3>
          <p className="text-sm text-gray-500">
            Location de caisses à savon disponible. Contactez-nous pour plus d&apos;informations.
          </p>
        </div>
      </div>
    </div>
  );
}
