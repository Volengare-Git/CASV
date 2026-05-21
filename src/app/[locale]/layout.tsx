import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: {
    template: "%s · CASV Versoix",
    default: "Grand-Prix de Versoix · CASV",
  },
  description:
    "Association des Caisses à Savon de Versoix — Course annuelle de véhicules sans moteur ouverte à la jeunesse.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang={locale} className={`${geist.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navigation user={user ? { email: user.email } : null} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
