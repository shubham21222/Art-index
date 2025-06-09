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

    // Map data to a format compatible with FeaturedGalleries component
    const formattedGalleries = galleries.map((gallery) => ({
      id: gallery.profileInternalID, // Use profileInternalID as the unique ID
      href: gallery.profileHref, // Profile href
      name: gallery.name, // Partner name
      location: gallery.featuredShow?.city || "N/A", // City from featured show
      image: gallery.featuredShow?.coverImage || "/placeholder.svg", // Cover image src
    }));

    // Send formatted data as JSON
    res.status(200).json({ galleries: formattedGalleries });
  } catch (error) {
    console.error("Error fetching galleries from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch galleries" });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}