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
    const db = client.db("contemporary_design_db");
    const collection = db.collection("contemporary_design");

    const galleries = await collection.find({}).toArray();

    const formattedGalleries = galleries.map((gallery) => ({
      _id: gallery._id, // Include MongoDB _id
      internalID: gallery.internalID,
      slug: gallery.slug,
      name: gallery.name,
      href: gallery.href,
      initials: gallery.initials,
      locations: gallery.locationsConnection?.edges.map(edge => ({
        city: edge.node.city,
        id: edge.node.id
      })) || [],
      categories: gallery.categories || [],
      image: gallery.profile?.image?.cropped?.src || "/placeholder.svg",
    }));

    res.status(200).json({ galleries: formattedGalleries });
  } catch (error) {
    console.error("Error fetching contemporary design from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch galleries" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}