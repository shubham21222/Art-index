import { NextResponse } from 'next/server';

export function middleware(request) {
  // Temporarily disabled to prevent white screen issues
  // Let client-side authentication handle everything
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
  ],
}; 