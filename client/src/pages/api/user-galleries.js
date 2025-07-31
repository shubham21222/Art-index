export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch galleries from the correct server API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
    const response = await fetch(`${apiUrl}/gallery/all`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.status || !data.items) {
      throw new Error('Invalid response format from server');
    }

    console.log(`Found ${data.items.length} galleries from server API`);

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
    const formattedGalleries = data.items
      .filter(gallery => gallery && gallery._id && gallery.title) // Filter out invalid galleries
      .map((gallery) => {
        try {
          // Generate slug from title if not present
          const slug = gallery.slug || gallery.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Get profile image with validation - use first image from images array
          const profileImage = gallery.images && gallery.images.length > 0 && isValidImageUrl(gallery.images[0])
            ? gallery.images[0]
            : "/placeholder.jpeg";

          return {
            _id: gallery._id,
            slug: slug,
            name: gallery.title, // Use title as name
            description: gallery.description || "",
            profileImage: profileImage,
            contact: gallery.contact || {},
            artworks: gallery.artworks || [],
            isActive: gallery.active !== false, // Use active field
            createdBy: gallery.createdBy,
            createdAt: gallery.createdAt,
            updatedAt: gallery.updatedAt,
            // Compatibility fields for existing components
            image: {
              src: profileImage,
              width: 445,
              height: 334
            },
            city: gallery.city || "Unknown",
            country: gallery.country || "Unknown",
            categories: gallery.categoryName ? [{ name: gallery.categoryName }] : [],
            type: "gallery"
          };
        } catch (error) {
          console.error("Error formatting gallery:", error, gallery);
          return null;
        }
      })
      .filter(gallery => gallery !== null) // Remove any failed mappings
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); // Sort by creation date, newest first

    console.log(`Successfully formatted ${formattedGalleries.length} galleries`);

    // Send formatted data as JSON
    res.status(200).json({ galleries: formattedGalleries });
  } catch (error) {
    console.error("Error fetching galleries from server API:", error);
    res.status(500).json({ error: "Failed to fetch galleries" });
  }
} 