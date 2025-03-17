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

  const { after, limit = 10 } = req.query; // Support pagination and limit

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("shows_db");
    const collection = db.collection("shows");

    const query = after ? { _id: { $gt: after } } : {};
    const shows = await collection
      .find(query)
      .sort({ _id: 1 }) // Sort by insertion order
      .limit(parseInt(limit))
      .toArray();

    const hasNextPage = shows.length === parseInt(limit);
    const endCursor = shows.length > 0 ? shows[shows.length - 1]._id : null;

    const formattedShows = shows.map((show) => ({
      id: show.id,
      name: show.name,
      href: show.href,
      startDate: show.startAt,
      endDate: show.endAt,
      partnerName: show.partnerName,
      artworks: show.artworks.map((artwork) => ({
        title: artwork.title,
        image: artwork.image || "/placeholder.svg",
        artistNames: artwork.artistNames,
        href: artwork.href,
        slug: artwork.slug,
        date: artwork.date,
        saleMessage: artwork.saleMessage,
      })),
    }));

    res.status(200).json({
      shows: formattedShows,
      pageInfo: { hasNextPage, endCursor },
    });
  } catch (error) {
    console.error("Error fetching shows from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch shows" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}