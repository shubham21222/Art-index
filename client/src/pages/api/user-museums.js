export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch museums from the correct server API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
    const response = await fetch(`${apiUrl}/museum/all`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.status || !data.items) {
      throw new Error('Invalid response format from server');
    }

    console.log(`Found ${data.items.length} museums from server API`);

    // Helper function to validate image URLs
    const isValidImageUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      if (url === "/placeholder.jpeg") return true;
      if (url.startsWith('data:')) return true;
      if (url.startsWith('blob:')) return true;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Check if it's a real image URL, not a placeholder
        return !url.includes('example.com') && 
               !url.includes('placeholder.com') && 
               !url.includes('dummy.com');
      }
      return url.startsWith('/');
    };

    // Map data to a format compatible with the frontend
    const formattedMuseums = data.items
      .filter(museum => museum && museum._id && museum.name) // Filter out invalid museums
      .map((museum) => {
        try {
          // Generate slug from name if not present
          const slug = museum.slug || museum.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Get profile image with validation
          const profileImage = isValidImageUrl(museum.profileImage) 
            ? museum.profileImage 
            : "/placeholder.jpeg";

          return {
            _id: museum._id,
            slug: slug,
            name: museum.name,
            description: museum.description || "",
            profileImage: profileImage,
            contact: museum.contact || {},
            events: museum.events || [],
            artworks: museum.artworks || [],
            isActive: museum.isActive !== false, // Default to true
            createdBy: museum.createdBy,
            createdAt: museum.createdAt,
            updatedAt: museum.updatedAt,
            // Compatibility fields for existing components
            image: {
              src: profileImage,
              width: 445,
              height: 334
            },
            city: museum.city || "Unknown",
            country: museum.country || "Unknown",
            categories: museum.categories || [],
            type: "museum"
          };
        } catch (error) {
          console.error("Error formatting museum:", error, museum);
          return null;
        }
      })
      .filter(museum => museum !== null) // Remove any failed mappings
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); // Sort by creation date, newest first

    console.log(`Successfully formatted ${formattedMuseums.length} museums`);

    // Send formatted data as JSON
    res.status(200).json({ museums: formattedMuseums });
  } catch (error) {
    console.error("Error fetching museums from server API:", error);
    res.status(500).json({ error: "Failed to fetch museums" });
  }
} 