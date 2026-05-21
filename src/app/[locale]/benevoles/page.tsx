import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BenevolesForm from "./benevoles-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("volunteers");
  return { title: t("title") };
}

export default function BenevolesPage() {
  return <BenevolesForm />;
}
