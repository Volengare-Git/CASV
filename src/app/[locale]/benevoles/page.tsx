import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import BenevolesForm from "./benevoles-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("volunteers");
  return { title: t("title") };
}

export default async function BenevolesPage() {
  const supabase = await createClient();

  const { data: edition } = await supabase
    .from("editions")
    .select("id, name")
    .eq("is_active", true)
    .single();

  const { data: posts } = await supabase
    .from("volunteer_posts")
    .select("id, name, start_time, end_time, capacity")
    .eq("edition_id", edition?.id ?? "")
    .order("display_order");

  return <BenevolesForm editionId={edition?.id ?? ""} posts={posts ?? []} />;
}
