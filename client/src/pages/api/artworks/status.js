export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artsyId, slug } = req.query;

  if (!artsyId && !slug) {
    return res.status(400).json({ error: "Either artsyId or slug is required" });
  }

  try {
    // Forward the request to the server API
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
    const serverEndpoint = `${serverUrl}/artworks/status?${new URLSearchParams(req.query).toString()}`;
    
    console.log('Forwarding status check to:', serverEndpoint);
    
    const serverResponse = await fetch(serverEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await serverResponse.json();
    console.log('Server status response:', { status: serverResponse.status, data });

    if (!serverResponse.ok) {
      console.error('Server error response:', data);
      return res.status(serverResponse.status).json({ 
        error: data.error || 'Failed to get artwork status',
        details: data.details || 'Unknown server error'
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in artwork status API route:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
