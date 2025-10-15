import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const protectedRoutes = ['/sites', '/content'];
  if (protectedRoutes.some((p) => pathname.startsWith(p)) && !token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  // If already authenticated, prevent visiting /login again
  if (pathname.startsWith('/login') && token) {
    url.pathname = '/sites';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/sites/:path*', '/content/:path*', '/login'],
};
