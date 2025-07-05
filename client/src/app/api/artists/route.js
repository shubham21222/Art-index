import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Artists API is working',
    endpoint: process.env.GRAPHQL_ENDPOINT || 'https://metaphysics-cdn.artsy.net/v2'
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    console.log('API Request:', { query: query.substring(0, 100) + '...', variables });

    // You can replace this URL with your actual GraphQL endpoint
    const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 'https://metaphysics-cdn.artsy.net/v2';

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Art-Index/1.0',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Add any required headers for your GraphQL API
        // 'Authorization': `Bearer ${process.env.GRAPHQL_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('GraphQL response not ok:', response.status, response.statusText);
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GraphQL Response:', { success: !!data.data, errors: data.errors?.length || 0 });

    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'GraphQL query failed', details: data.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artists', message: error.message },
      { status: 500 }
    );
  }
} 