import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
        <p className="text-gray-500 mb-6">
          Vous n'avez pas les droits d'accès à cette section.
        </p>
        <Link href="/compte" className="text-sm text-red-600 hover:underline">
          Retour à mon compte
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Administration CASV
            </span>
            <span className="text-xs text-gray-500">
              {profile.first_name} {profile.last_name}
            </span>
          </div>
          <AdminNav />
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
