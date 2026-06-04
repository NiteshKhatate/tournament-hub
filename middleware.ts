import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/organisers']

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !authToken) {
    // User is not authenticated and trying to access protected route
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authToken) {
    try {
      const user = JSON.parse(authToken)
      if (user.role === 'team_admin') {
        const blockedPrefixes = ['/organisers', '/teams']
        if (
          blockedPrefixes.some((route) =>
            request.nextUrl.pathname.startsWith(route)
          )
        ) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch {
      // ignore invalid token; protected routes still require valid session elsewhere
    }
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (api routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
