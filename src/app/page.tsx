// This file should never be reached — next-intl middleware rewrites / → /fr
// Added as a safety fallback only
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/fr");
}
