import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  // Ensure robots.txt and sitemap files are always accessible
  if (pathname === '/robots.txt' || pathname.startsWith('/sitemap')) {
    // Create response with no restrictions
    const response = NextResponse.next()
    
    // Remove any restrictive headers that might block access
    response.headers.delete('X-Frame-Options')
    response.headers.delete('X-Content-Type-Options')
    
    // Ensure the response is publicly accessible
    response.headers.set('X-Robots-Tag', 'all')
    response.headers.set('Access-Control-Allow-Origin', '*')
    
    return response
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}