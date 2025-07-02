export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://b0ml7g848r-dsn.algolia.net/1/indexes/production_all_artworks/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-agent': 'Algolia for JavaScript (3.35.1); Browser',
        'x-algolia-application-id': 'B0ML7G848R',
        'x-algolia-api-key': 'f9325566b566be56c6896db6c90a8eab'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 