"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";

const TABS = [
  { label: "Tableau de bord", href: "/admin" },
  { label: "Inscriptions", href: "/admin/inscriptions" },
  { label: "Bénévoles", href: "/admin/benevoles" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/admin"
            ? /\/admin$/.test(pathname)
            : pathname.includes(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-red-600 text-red-600"
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
