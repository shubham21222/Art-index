// pages/api/galleries.js
import { MongoClient } from "mongodb";

// Optional: Disable body parser if you plan to handle raw requests later
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = 'test';

  if (!uri || !dbName) {
    console.error("Missing MongoDB configuration:", { uri: !!uri, dbName });
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName); // Use the database from your Python script
    const collection = db.collection("galleries");

    // Fetch up to 50 galleries (matching the original query limit)
    const galleries = await collection.find({}).limit(50).toArray();
    console.log(`Found ${galleries.length} galleries`);

    // Map data to a format compatible with FeaturedGalleries component with better error handling
    const formattedGalleries = galleries
      .filter(gallery => gallery && gallery._id) // Filter out null/undefined galleries
      .map((gallery) => {
        try {
          return {
            _id: gallery._id, // Include MongoDB _id
            id: gallery.profileInternalID || gallery._id?.toString() || `gallery_${Date.now()}`,
            href: gallery.profileHref || `/gallery/${gallery.slug || gallery._id}`,
            name: gallery.name || gallery.partnerName || "Unknown Gallery",
            location: gallery.featuredShow?.city || gallery.city || gallery.location || "Location TBD",
            image: gallery.featuredShow?.coverImage || gallery.image || gallery.coverImage || "/placeholder.jpeg",
          };
        } catch (error) {
          console.error("Error formatting gallery:", error, gallery);
          return null;
        }
      })
      .filter(gallery => gallery !== null); // Remove any failed mappings

    console.log(`Successfully formatted ${formattedGalleries.length} galleries`);

    // Send formatted data as JSON
    res.status(200).json({ galleries: formattedGalleries });
  } catch (error) {
    console.error("Error fetching galleries from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch galleries", details: error.message });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}