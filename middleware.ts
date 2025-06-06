import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Rotas públicas
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Rotas que requerem autenticação
  const protectedRoutes = ['/my-reservations', '/admin', '/events/create']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Se é uma rota protegida e não tem token
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    // Clear any stale auth data
    response.cookies.delete('token')
    return response
  }

  // Se está tentando acessar login/register com token válido
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}