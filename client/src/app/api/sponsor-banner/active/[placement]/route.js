import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request, { params }) {
  try {
    const { placement } = await params;
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || '';
    
    const url = new URL(`${BASE_URL}/sponsor-banner/active/${placement}`);
    if (position) {
      url.searchParams.append('position', position);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching active sponsor banners:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 