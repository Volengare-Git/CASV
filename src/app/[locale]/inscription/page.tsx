import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InscriptionForm from "./inscription-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("inscription");
  return { title: t("title") };
}

export default function InscriptionPage() {
  return <InscriptionForm />;
}
