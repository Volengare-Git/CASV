import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18n = createMiddleware(routing);

/* ── Maintenance mode check with 30s in-process cache ─────────────────── */
let maintenanceCache: { enabled: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

async function isMaintenanceEnabled(supabaseUrl: string, anonKey: string): Promise<boolean> {
  if (maintenanceCache && Date.now() - maintenanceCache.ts < CACHE_TTL) {
    return maintenanceCache.enabled;
  }
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?select=maintenance_mode&id=eq.1&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const enabled: boolean = data?.[0]?.maintenance_mode ?? false;
    maintenanceCache = { enabled, ts: Date.now() };
    return enabled;
  } catch {
    return false; // fail open — never block the site on a fetch error
  }
}

/** Paths that bypass maintenance mode (strip the /en prefix before checking) */
const MAINTENANCE_BYPASS = [
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/maintenance",
];

/* ── Middleware ────────────────────────────────────────────────────────── */
export default async function middleware(request: NextRequest) {
  const i18nResponse = handleI18n(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl.startsWith("http") || !supabaseKey) {
    return i18nResponse;
  }

  // ── 1. Maintenance check ─────────────────────────────────────────────
  const rawPath  = request.nextUrl.pathname;
  // Normalise: strip the /en locale prefix so bypass list stays locale-agnostic
  const cleanPath = rawPath.startsWith("/en") ? rawPath.slice(3) || "/" : rawPath;
  const isBypassed = MAINTENANCE_BYPASS.some((p) => cleanPath.startsWith(p));

  if (!isBypassed) {
    const maintenance = await isMaintenanceEnabled(supabaseUrl, supabaseKey);
    if (maintenance) {
      const maintenancePath = rawPath.startsWith("/en") ? "/en/maintenance" : "/maintenance";
      // Avoid redirect loop — the rewrite to /maintenance itself is already bypassed above
      return NextResponse.redirect(new URL(maintenancePath, request.url));
    }
  }

  // ── 2. Supabase session refresh (do not remove) ──────────────────────
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          i18nResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
