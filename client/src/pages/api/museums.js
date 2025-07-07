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
    const collection = db.collection("museums");

    const institutions = await collection.find({}).toArray();

    const formattedInstitutions = institutions.map((institution) => {
      // Extract city from locations[0].city, or from contact.address, or fallback
      let city = null;
      if (institution.locations && institution.locations.length > 0 && institution.locations[0].city) {
        city = institution.locations[0].city;
      } else if (institution.contact && institution.contact.address) {
        const parts = institution.contact.address.split(',').map(part => part.trim());
        if (parts.length > 0) {
          city = parts[0];
        }
      }
      if (!city) city = 'Unknown';

      // Keep country for display, but not for filtering
      let country = null;
      if (institution.locations && institution.locations.length > 0 && institution.locations[0].country) {
        country = institution.locations[0].country;
      } else if (institution.contact && institution.contact.address) {
        const parts = institution.contact.address.split(',').map(part => part.trim());
        if (parts.length > 1) {
          country = parts[parts.length - 1];
        }
      }
      if (!country) country = 'Unknown';

      return {
        _id: institution._id, // Include MongoDB _id
        internalID: institution.internalID,
        slug: institution.slug,
        name: institution.name,
        href: institution.href,
        initials: institution.initials,
        locations: institution.locations || [],
        categories: institution.categories || [],
        city, // Always include city
        country, // Always include country
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
      };
    });

    res.status(200).json({ institutions: formattedInstitutions });
  } catch (error) {
    console.error("Error fetching museums institutions from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch institutions" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}