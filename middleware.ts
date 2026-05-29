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
    '/((?!api/auth|api/public|api/health|api/ai-interview|api/db-init|api/companies|api/setup|api/migrate|api/performance|api/projects|api/tasks|api/helpdesk|api/subvendors|api/roles|api/skills|api/policies|api/timesheets|api/requisitions|_next/static|_next/image|favicon.ico|logo.svg|login|mobile-app|job-portal|interview|manifest.webmanifest|sw.js|robots.txt).*)',
  ],
}
