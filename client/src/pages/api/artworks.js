import { MongoClient } from "mongodb";

// Optional: Disable body parser if you plan to handle raw requests later
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  let client;

  try {
    // Connect to MongoDB (no deprecated options)
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("artworks");

    // Fetch up to 20 artworks to match your component's original limit
    const artworks = await collection.find({}).limit(20).toArray();

    // Map data to ensure compatibility with CuratorsPicks component
    const formattedArtworks = artworks.map((artwork) => ({
      internalID: artwork.internalID,
      slug: artwork.slug,
      href: artwork.href,
      title: artwork.title,
      artistNames: artwork.artistNames,
      image: {
        resized: {
          src: artwork.image.resized.src,
          width: artwork.image.resized.width,
          height: artwork.image.resized.height,
        },
      },
      saleMessage: artwork.saleMessage,
      partner: {
        name: artwork.partner.name,
      },
      priceCurrency: artwork.priceCurrency,
    }));

    // Send formatted data as JSON
    res.status(200).json({ artworks: formattedArtworks });
  } catch (error) {
    console.error("Error fetching artworks from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}