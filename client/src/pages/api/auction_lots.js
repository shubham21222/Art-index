import { MongoClient } from "mongodb";

// Optional: Disable body parser if you plan to handle raw requests later
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = "auction_lots_db";

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("auction_lots");

    // Fetch up to 20 auction lots
    const auctionLots = await collection.find({}).limit(20).toArray();

    // Map data to match the provided sample schema
    const formattedAuctionLots = auctionLots.map((lot) => ({
      internalID: lot.internalID,
      slug: lot.slug,
      href: lot.href,
      title: lot.title,
      artistNames: lot.artistNames,
      image: {
        src: lot.image?.src,           // Direct image source
        width: lot.image?.width,       // Image width
        height: lot.image?.height,     // Image height
      },
      collectorSignals: {
        auction: {
          lotClosesAt: lot.collectorSignals?.auction?.lotClosesAt,
          registrationEndsAt: lot.collectorSignals?.auction?.registrationEndsAt,
        },
      },
      sale: {
        endAt: lot.sale?.endAt,        // Auction end time
        isClosed: lot.sale?.isClosed,  // Auction status
      },
      saleArtwork: {
        highestBid: {
          display: lot.saleArtwork?.highestBid?.display, // Current highest bid (if available)
        },
        openingBid: {
          display: lot.saleArtwork?.openingBid?.display, // Opening bid
        },
      },
    }));

    // Send formatted data as JSON
    res.status(200).json({ auctionLots: formattedAuctionLots });
  } catch (error) {
    console.error("Error fetching auction lots from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch auction lots" });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}