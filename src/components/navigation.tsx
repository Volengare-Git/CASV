"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import LocaleSwitcher from "@/components/locale-switcher";
import { Menu, X, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const raceLinks = [
    { href: "/course", label: t("program") },
    { href: "/course#reglement", label: t("rules") },
    { href: "/course#acces", label: t("access") },
    { href: "/galerie", label: t("gallery") },
    { href: "/resultats", label: t("results") },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
            <Flag className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden font-bold tracking-tight text-gray-900 sm:block">
            <span className="text-red-600">CASV</span> Versoix
          </span>
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  isActive("/course") || isActive("/galerie") || isActive("/resultats")
                    ? "text-red-600"
                    : ""
                )}
              >
                {t("race")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  {raceLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href as "/course"}
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                href="/inscription"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive("/inscription") ? "text-red-600" : ""
                )}
              >
                {t("register")}
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                href="/benevoles"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive("/benevoles") ? "text-red-600" : ""
                )}
              >
                {t("volunteers")}
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                href="/association"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive("/association") ? "text-red-600" : ""
                )}
              >
                {t("association")}
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                href="/contact"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive("/contact") ? "text-red-600" : ""
                )}
              >
                {t("contact")}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          <Link href="/login" className="hidden lg:block">
            <Button variant="outline" size="sm">
              {t("login")}
            </Button>
          </Link>

          <Link href="/inscription" className="hidden lg:block">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              {t("register")}
            </Button>
          </Link>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <span className="font-bold">
                  <span className="text-red-600">CASV</span> Versoix
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex flex-col gap-1 p-4">
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Course
                </p>
                {raceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href as "/course"}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-2" />

                {[
                  { href: "/inscription", label: t("register") },
                  { href: "/benevoles", label: t("volunteers") },
                  { href: "/association", label: t("association") },
                  { href: "/contact", label: t("contact") },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href as "/inscription"}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-2" />

                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("login")}
                </Link>

                <Link href="/inscription" onClick={() => setMobileOpen(false)}>
                  <Button className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white">
                    {t("register")}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
