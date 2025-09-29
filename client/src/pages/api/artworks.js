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
    // Connect to MongoDB (no deprecated options)
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("artworks");

    // Fetch up to 200 artworks for carousel components
    const artworks = await collection.find({}).limit(200).toArray();
    
    // Log the first artwork to see its structure
    console.log("Sample artwork data:", JSON.stringify(artworks[0], null, 2));

    // Map data to ensure compatibility with CuratorsPicks component
    const formattedArtworks = artworks.map((artwork) => {
      // Calculate dimensions based on aspect ratio if available
      const aspectRatio = artwork.image?.aspectRatio || 0.75;
      const width = 350; // Fixed width
      const height = Math.round(width / aspectRatio);
      
      return {
        _id: artwork._id, // Include MongoDB _id
        internalID: artwork.internalID || artwork._id?.toString(),
        slug: artwork.slug || '',
        href: artwork.href || '',
        title: artwork.title || 'Untitled',
        artistNames: artwork.artist?.name || 'Unknown Artist',
        image: {
          resized: {
            src: artwork.image?.url || 'https://placehold.co/350x467?text=Artwork+Image',
            width: width,
            height: height,
          },
        },
        saleMessage: artwork.saleMessage || 'Price on request',
        partner: {
          name: artwork.partner?.name || 'Unknown Gallery',
        },
        priceCurrency: artwork.priceCurrency || 'USD',
      };
    });

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