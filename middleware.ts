import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// Middleware — Supabase Auth Session Refresh + Protected Routes
// Workspace 1 Part 20
// ============================================================

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase not configured, skip auth check (mock mode)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project") || supabaseUrl.includes("placeholder")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Refresh session — important to keep user logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes — always allowed
  const publicRoutes = ["/", "/login", "/signup", "/api/health"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/health") || pathname.startsWith("/_next")
  );

  // Protected routes — require auth
  const protectedPrefixes = [
    "/academics",
    "/skills",
    "/projects",
    "/portfolio",
    "/freelancing",
    "/career",
    "/documents",
    "/ai-hub",
    "/analytics",
    "/settings",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  // If protected route and no user, redirect to login
  // BUT: For now in Workspace 1, we allow mock mode, so we don't enforce strictly
  // In production, uncomment this:
  /*
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  */

  // If logged in and trying to access login/signup, redirect to home
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
