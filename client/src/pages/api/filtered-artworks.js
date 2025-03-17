// pages/api/filtered-artworks.js
import { MongoClient } from "mongodb";

// Optional: Disable body parser if you plan to handle raw requests later
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = "artworks_db2";

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  const { after, first = 50 } = req.query; // Support pagination with 'after' and 'first'

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("artworks_db2"); // Use the database from the Python script
    const collection = db.collection("filtered_artworks");

    // Build query for pagination
    let query = {};
    if (after) {
      query = { internalID: { $gt: after } }; // Use internalID for cursor-based pagination
    }

    // Fetch artworks with limit
    const artworks = await collection
      .find(query)
      .sort({ internalID: 1 }) // Sort by internalID for consistent pagination
      .limit(parseInt(first))
      .toArray();

    // Determine pagination info
    const totalCount = await collection.countDocuments();
    const hasNextPage = artworks.length === parseInt(first) && artworks[artworks.length - 1].internalID < totalCount;
    const endCursor = artworks.length > 0 ? artworks[artworks.length - 1].internalID : null;

    // Map data to a format compatible with ArtGallery component
    const formattedArtworks = artworks.map((artwork) => ({
      id: artwork.id,
      slug: artwork.slug,
      image: artwork.image?.url || "/images/placeholder.jpg",
      title: artwork.title,
      artist: artwork.artist?.name,
      gallery: artwork.partner?.name,
      price: artwork.saleMessage || "Price on request",
      primaryLabel: artwork.collectorSignals?.primaryLabel || "Available",
      demandRank: artwork.marketPriceInsights?.demandRank || "N/A",
    }));

    // Send formatted data as JSON with pagination info
    res.status(200).json({
      artworks: formattedArtworks,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    });
  } catch (error) {
    console.error("Error fetching filtered artworks from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}