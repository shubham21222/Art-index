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
  const dbName = "test";

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  const { 
    search, 
    category, 
    sortBy = "internalID",
    sortOrder = "asc",
    page = 1,
    limit = 100
  } = req.query;

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("artworks");

    // Build query for filters
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'artist.name': { $regex: search, $options: 'i' } },
        { 'partner.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter - using the actual field from your data
    if (category && category !== 'All Categories') {
      query.category = { $regex: category, $options: 'i' };
    }

    // Build sort object
    let sortObject = {};
    if (sortBy === 'price') {
      sortObject.saleMessage = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'date') {
      sortObject.date = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObject.internalID = sortOrder === 'desc' ? -1 : 1;
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const totalCount = await collection.countDocuments(query);

    // Fetch artworks with pagination
    const artworks = await collection
      .find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Map data to a format compatible with ArtGallery component
    const formattedArtworks = artworks.map((artwork) => ({
      _id: artwork._id,
      id: artwork.id,
      slug: artwork.slug,
      image: artwork.image?.url || "/images/placeholder.jpg",
      title: artwork.title,
      artist: artwork.artist?.name,
      gallery: artwork.partner?.name,
      price: artwork.saleMessage || "Price on request",
      primaryLabel: artwork.collectorSignals?.primaryLabel || "Available",
      demandRank: artwork.marketPriceInsights?.demandRank || "N/A",
      category: artwork.category,
      medium: artwork.medium,
      rarity: artwork.rarity,
      year: artwork.date,
      dimensions: artwork.dimensions,
    }));

    // Calculate pagination info
    const hasNextPage = skip + parseInt(limit) < totalCount;
    const hasPreviousPage = parseInt(page) > 1;

    // Send formatted data as JSON with pagination info
    res.status(200).json({
      artworks: formattedArtworks,
      totalCount,
      currentPage: parseInt(page),
      hasNextPage,
      hasPreviousPage,
      totalPages: Math.ceil(totalCount / parseInt(limit))
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