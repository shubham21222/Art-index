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

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("drawings_artworks");

    const artworks = await collection.find({}).limit(30).toArray();

    const formattedArtworks = artworks.map((artwork) => ({
      internalID: artwork.internalID,
      slug: artwork.slug,
      title: artwork.title,
      date: artwork.date,
      artistNames: artwork.artistNames,
      image: {
        src: artwork.image?.src || 'https://placehold.co/445x534?text=Drawing',
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

    res.status(200).json({ galleries: formattedArtworks });
  } catch (error) {
    console.error("Error fetching drawings artworks from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}