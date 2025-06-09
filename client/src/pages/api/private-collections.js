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
    const collection = db.collection("private_collections");

    const institutions = await collection.find({}).toArray();

    const formattedInstitutions = institutions.map((institution) => ({
      internalID: institution.internalID,
      slug: institution.slug,
      name: institution.name,
      href: institution.href,
      initials: institution.initials,
      locations: institution.locations || [],
      categories: institution.categories || [],
      image: {
        src: institution.profile?.image?.src || "/placeholder.svg",
        srcSet: institution.profile?.image?.srcSet,
        width: 445,
        height: 334,
      },
      profile: {
        avatar: institution.profile?.avatar,
        icon: institution.profile?.icon,
      },
      type: institution.type,
    }));

    res.status(200).json({ institutions: formattedInstitutions });
  } catch (error) {
    console.error("Error fetching private collections institutions from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch institutions" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}