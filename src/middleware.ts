import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_BASED_ROUTES: Record<string, string[]> = {
  super_admin: ["/admin/dashboard", "/admin/projects", "/admin/services", "/admin/testimonials", "/admin/contact-queries", "/admin/roles-management", "/admin/notifications", "/admin/chatbot"],
  content_creator: ["/admin/dashboard", "/admin/projects", "/admin/testimonials", "/admin/services", "/admin/notifications", "/admin/chatbot"],
  support_staff: ["/admin/dashboard", "/admin/contact-queries", "/admin/notifications", "/admin/chatbot"]
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value

  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/admin/login')
  const isAdminPage = pathname.startsWith('/admin')

  // Not an admin route — let it through
  if (!isAdminPage) return NextResponse.next()

  // No token and trying to access protected admin page → redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Has token and trying to access login → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Role-based access control
  if (token && role) {
    const allowedRoutes = ROLE_BASED_ROUTES[role]
    const isAllowed = allowedRoutes?.some((route) => pathname.startsWith(route))
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


