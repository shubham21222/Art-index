import { NextResponse } from 'next/server';
import { BASE_URL } from '@/config/baseUrl';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        
        const response = await fetch(`${BASE_URL}/artwork-pricing/get?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching artwork pricing:', error);
        return NextResponse.json(
            { error: 'Failed to fetch artwork pricing' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const token = request.headers.get('authorization');

        // Check if this is a global adjustment application request
        if (body.originalPrice && body.originalPriceType) {
            // This is a global adjustment application request
            const response = await fetch(`${BASE_URL}/artwork-pricing/apply-global-adjustment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            return NextResponse.json(data);
        } else {
            // This is a create/update request (requires authentication)
            const response = await fetch(`${BASE_URL}/artwork-pricing/create-or-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('Error creating/updating artwork pricing:', error);
        return NextResponse.json(
            { error: 'Failed to create/update artwork pricing' },
            { status: 500 }
        );
    }
} 