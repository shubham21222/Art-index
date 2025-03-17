import { MongoClient } from "mongodb";

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
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("private_collections_db");
    const collection = db.collection("private_collections");

    const collections = await collection.find({}).toArray();

    const formattedCollections = collections.map((collection) => ({
      internalID: collection.internalID,
      slug: collection.slug,
      name: collection.name,
      href: collection.href,
      initials: collection.initials,
      locations: collection.locationsConnection?.edges.map(edge => ({
        city: edge.node.city,
        id: edge.node.id
      })) || [],
      categories: collection.categories || [],
      image: collection.profile?.image?.cropped?.src || "/placeholder.svg",
    }));

    res.status(200).json({ collections: formattedCollections });
  } catch (error) {
    console.error("Error fetching private collections from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}