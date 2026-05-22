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
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|login).*)',
  ],
}
