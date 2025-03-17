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
    const db = client.db("museums_db");
    const collection = db.collection("museums");

    const museums = await collection.find({}).toArray();

    const formattedMuseums = museums.map((museum) => ({
      internalID: museum.internalID,
      slug: museum.slug,
      name: museum.name,
      href: museum.href,
      initials: museum.initials,
      locations: museum.locationsConnection?.edges.map(edge => ({
        city: edge.node.city,
        id: edge.node.id
      })) || [],
      categories: museum.categories || [],
      image: museum.profile?.image?.cropped?.src || "/placeholder.svg",
    }));

    res.status(200).json({ museums: formattedMuseums });
  } catch (error) {
    console.error("Error fetching museums from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch museums" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}