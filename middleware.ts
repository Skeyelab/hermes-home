import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthChallenge, isAdminAuthorized } from './src/app/admin/auth'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (isAdminAuthorized(request.headers.get('authorization'))) {
    return NextResponse.next()
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': getAdminAuthChallenge(),
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
