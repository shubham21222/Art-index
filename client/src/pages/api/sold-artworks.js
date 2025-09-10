import { MongoClient } from "mongodb";

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

  const { status = 'sold', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("newgalleries");

    // Find galleries with artworks matching the status
    const galleries = await collection.find({
      'artworks.soldStatus': status
    }).toArray();

    // Extract artworks with gallery info
    let artworks = [];
    galleries.forEach(gallery => {
      gallery.artworks.forEach(artwork => {
        if (artwork.soldStatus === status) {
          artworks.push({
            ...artwork,
            galleryId: gallery._id,
            galleryTitle: gallery.title,
            galleryOwner: gallery.createdBy
          });
        }
      });
    });

    // Sort by sold date (newest first)
    artworks.sort((a, b) => new Date(b.soldAt || b.createdAt) - new Date(a.soldAt || a.createdAt));

    // Apply pagination
    const total = artworks.length;
    const paginatedArtworks = artworks.slice(skip, skip + parseInt(limit));

    res.status(200).json({ 
      artworks: paginatedArtworks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching sold artworks from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch sold artworks" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
