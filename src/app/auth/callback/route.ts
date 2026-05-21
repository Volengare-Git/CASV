import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback handler.
 * Handles password reset, magic links, and OAuth redirects.
 *
 * Supabase redirects here after email confirmation with either:
 *  - ?code=xxx  (PKCE flow — exchange for session, then redirect)
 *  - ?error=xxx (auth error — show message on login page)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery" for reset password
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Auth error returned by Supabase (expired link, already used, etc.)
  if (error) {
    const message = errorDescription ?? error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  // Exchange the one-time code for a session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Password reset flow → redirect to the reset-password form
    // (type=recovery set by Supabase, or next=/reset-password set by our redirectTo)
    if (type === "recovery" || next.startsWith("/reset-password")) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    // Other flows (magic link, email confirmation) → use next param or account page
    const destination = next.startsWith("/") ? `${origin}${next}` : `${origin}/compte`;
    return NextResponse.redirect(destination);
  }

  // Fallback
  return NextResponse.redirect(`${origin}/`);
}
