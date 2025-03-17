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
    const db = client.db("modern_art_db");
    const collection = db.collection("modern_contemporary_art");

    const institutions = await collection.find({}).toArray();

    const formattedInstitutions = institutions.map((institution) => ({
      internalID: institution.internalID,
      slug: institution.slug,
      name: institution.name,
      href: institution.href,
      initials: institution.initials,
      locations: institution.locationsConnection?.edges.map(edge => ({
        city: edge.node.city,
        id: edge.node.id
      })) || [],
      categories: institution.categories || [],
      image: institution.profile?.image?.cropped?.src || "/placeholder.svg",
    }));

    res.status(200).json({ institutions: formattedInstitutions });
  } catch (error) {
    console.error("Error fetching modern and contemporary art from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch institutions" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}