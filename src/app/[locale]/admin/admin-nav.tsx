"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";

const TABS = [
  { label: "Tableau de bord", href: "/admin", exact: true },
  { label: "Inscriptions", href: "/admin/inscriptions", exact: true },
  { label: "Catégories pilotes", href: "/admin/inscriptions/categories" },
  { label: "Bénévoles", href: "/admin/benevoles", exact: true },
  { label: "Postes", href: "/admin/benevoles/postes" },
  { label: "Planning", href: "/admin/benevoles/planning" },
  { label: "Tâches bénévoles", href: "/admin/benevoles/taches" },
  { label: "Résultats", href: "/admin/resultats" },
  { label: "Éditions", href: "/admin/editions" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname.endsWith(tab.href)
          : pathname.includes(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-blue-800 text-blue-800"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
