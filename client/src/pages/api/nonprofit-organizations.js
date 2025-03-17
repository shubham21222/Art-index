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
    const db = client.db("nonprofit_db");
    const collection = db.collection("nonprofit_organizations");

    const organizations = await collection.find({}).toArray();

    const formattedOrganizations = organizations.map((org) => ({
      internalID: org.internalID,
      slug: org.slug,
      name: org.name,
      href: org.href,
      initials: org.initials,
      locations: org.locationsConnection?.edges.map(edge => ({
        city: edge.node.city,
        id: edge.node.id
      })) || [],
      categories: org.categories || [],
      image: org.profile?.image?.cropped?.src || "/placeholder.svg",
    }));

    res.status(200).json({ organizations: formattedOrganizations });
  } catch (error) {
    console.error("Error fetching nonprofit organizations from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}