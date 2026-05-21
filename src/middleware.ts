import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18n = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const i18nResponse = handleI18n(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl.startsWith("http") || !supabaseKey) {
    return i18nResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            i18nResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refreshes Supabase session if expired — do not remove
  await supabase.auth.getUser();

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
