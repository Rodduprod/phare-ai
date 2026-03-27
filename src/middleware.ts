import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware Next.js — rafraîchit la session Supabase à chaque requête.
 * Redirige vers /compte/connexion si l'utilisateur tente d'accéder à /compte/profil sans être connecté.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchit la session (ne pas supprimer cet appel)
  const { data: { user } } = await supabase.auth.getUser();

  // Routes protégées : /compte/profil uniquement
  // /compte/connexion et /compte/inscription restent accessibles
  const isProtected = request.nextUrl.pathname.startsWith("/compte/profil");
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/compte/connexion";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si déjà connecté et tente d'aller sur login/inscription → rediriger vers profil
  const isAuthPage =
    request.nextUrl.pathname === "/compte/connexion" ||
    request.nextUrl.pathname === "/compte/inscription";
  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/compte/profil";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
