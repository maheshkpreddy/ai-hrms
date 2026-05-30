import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo.svg, public files
     * - login page itself
     * - mobile-app page (public download info)
     * - interview page (public candidate interview access)
     * - api/ai-interview (public candidate interview API)
     */
    '/((?!api/auth|api/public|api/health|api/ai-interview|api/db-init|api/companies|api/setup|api/migrate|api/reseed|api/seed|api/migrate-schema|api/check-schema|api/debug-auth|api/test-auth|_next/static|_next/image|favicon.ico|logo.svg|login|mobile-app|job-portal|interview|manifest.webmanifest|sw.js|robots.txt).*)',
  ],
}
