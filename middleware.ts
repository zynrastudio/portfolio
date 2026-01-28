import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that should only be accessible on the tools subdomain
const TOOLS_ROUTES = [
  '/send-message',
  '/api/send-client-message',
  '/api/generate-contract',
  '/api/generate-audit-pdf',
  '/api/generate-audit-preview',
  '/api/generate-pdf',
  '/api/generate-rejection-email',
  '/api/generate-welcome-email',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Check if the request is for a tools-only route
  const isToolsRoute = TOOLS_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // If it's a tools route, verify it's coming from the tools subdomain
  if (isToolsRoute) {
    const isToolsSubdomain = hostname.includes('tools.zynra.studio') || 
                            hostname.includes('tools.localhost') // for local development

    // Block access if not from tools subdomain
    if (!isToolsSubdomain) {
      // Return 404 to hide the existence of these routes
      return new NextResponse(null, { status: 404 })
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
