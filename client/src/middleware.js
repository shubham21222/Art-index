import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request (e.g. /admin, /admin/dashboard)
  const path = request.nextUrl.pathname;

  // If it's an admin route but not the login page
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // Check if user is authenticated (has a valid session token)
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // Redirect to admin login page if there's no token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/admin/:path*'],
}; 