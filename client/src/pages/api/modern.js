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

  // Get pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("modern_artworks");

    // Get total count for pagination
    const total = await collection.countDocuments({});

    // Get paginated artworks
    const artworks = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedArtworks = artworks.map((artwork) => ({
      _id: artwork._id, // Include MongoDB _id
      internalID: artwork.internalID,
      slug: artwork.slug,
      title: artwork.title,
      date: artwork.date,
      artistNames: artwork.artistNames,
      image: {
        src: artwork.image?.src || 'https://placehold.co/445x534?text=Modern+Art',
        width: artwork.image?.width || 445,
        height: artwork.image?.height || 534,
      },
      partner: {
        name: artwork.partner?.name || 'Unknown Gallery',
        href: artwork.partner?.href || '#',
      },
      saleMessage: artwork.saleMessage || 'Price on request',
      culturalMaker: artwork.culturalMaker,
      collectingInstitution: artwork.collectingInstitution,
    }));

    res.status(200).json({ 
      galleries: formattedArtworks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching modern artworks from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}