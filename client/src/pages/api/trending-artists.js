// pages/api/trending-artists.js
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
    const db = client.db(dbName); // Use the database from the Python script
    const collection = db.collection("artists");

    const artists = await collection.find({}).limit(20).toArray();

    // Map data to a format compatible with TrendingArtists component
    const formattedArtists = artists.map((artist) => ({
      id: artist.internalID,
      slug: artist.slug,
      name: artist.name,
      href: artist.href,
      nationalityAndBirthday: artist.formattedNationalityAndBirthday,
      artworkCount: artist.counts?.artworks || 0,
      forSaleArtworkCount: artist.counts?.forSaleArtworks || 0,
      image: artist.coverArtwork?.image?.cropped?.src || "/placeholder.svg",
    }));

    // Send formatted data as JSON
    res.status(200).json({ artists: formattedArtists });
  } catch (error) {
    console.error("Error fetching trending artists from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}