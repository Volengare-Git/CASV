import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("nav");

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo-casv.png"
                alt="CASV Versoix"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-gray-900">
                <span className="text-blue-800">CASV</span> Versoix
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Association des Caisses à Savon de Versoix
              <br />
              Grand-Prix annuel de véhicules sans moteur
            </p>
          </div>

          {/* Course */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Course
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/course", label: t("program") },
                { href: "/inscription", label: t("register") },
                { href: "/benevoles", label: t("volunteers") },
                { href: "/galerie", label: t("gallery") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as "/course"}
                    className="text-gray-500 hover:text-blue-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Association */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Association
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/association", label: t("association") },
                { href: "/contact", label: t("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as "/association"}
                    className="text-gray-500 hover:text-blue-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Association des Caisses à Savon de Versoix
          </p>
          <p className="text-xs text-gray-400">Versoix, Canton de Genève</p>
        </div>
      </div>
    </footer>
  );
}
