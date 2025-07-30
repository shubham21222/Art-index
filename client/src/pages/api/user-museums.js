import { MongoClient } from "mongodb";

// Helper function to validate image URLs
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // If it's already a valid URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Filter out example.com and other placeholder URLs
    if (url.includes('example.com') || url.includes('placeholder.com') || url.includes('dummy.com')) {
      return false;
    }
    return true;
  }
  
  // If it starts with www, add https://
  if (url.startsWith('www.')) {
    return true;
  }
  
  // If it's a relative path, return as is
  if (url.startsWith('/')) {
    return true;
  }
  
  // For other cases, treat as invalid
  return false;
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = 'test';

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("museums");

    // Fetch all museums from our database
    const museums = await collection.find({}).toArray();

    const formattedMuseums = museums.map((museum) => {
      // Create a slug from the museum name
      const slug = museum.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Validate and fix profile image URL
      let profileImage = museum.profileImage;
      if (!isValidImageUrl(profileImage)) {
        profileImage = "/placeholder.jpeg";
      }

      return {
        _id: museum._id,
        slug: slug,
        name: museum.name,
        description: museum.description,
        profileImage: profileImage,
        contact: museum.contact || {},
        events: museum.events || [],
        artworks: museum.artworks || [],
        isActive: museum.isActive,
        createdBy: museum.createdBy,
        createdAt: museum.createdAt,
        updatedAt: museum.updatedAt,
        // For compatibility with existing components
        image: {
          src: profileImage,
          width: 445,
          height: 334,
        },
        city: museum.contact?.address ? museum.contact.address.split(',')[0]?.trim() : 'Unknown',
        country: museum.contact?.address ? museum.contact.address.split(',').pop()?.trim() : 'Unknown',
        categories: museum.ArtType ? museum.ArtType.map(type => ({ name: type })) : [],
        type: 'museum'
      };
    });

    res.status(200).json({ museums: formattedMuseums });
  } catch (error) {
    console.error("Error fetching user museums from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch museums" });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 