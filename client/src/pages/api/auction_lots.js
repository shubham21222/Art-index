import { MongoClient } from "mongodb";

// Optional: Disable body parser if you plan to handle raw requests later
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = "test";

  if (!uri || !dbName) {
    console.error("Missing MongoDB configuration:", { uri: !!uri, dbName });
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("auctions");

    // Fetch up to 200 auction lots for carousel components
    const auctionLots = await collection.find({}).limit(200).toArray();
    console.log(`Found ${auctionLots.length} auction lots`);

    // Map data to match the provided sample schema with better error handling
    const formattedAuctionLots = auctionLots
      .filter(lot => lot && lot._id) // Filter out null/undefined lots
      .map((lot) => {
        try {
          return {
            _id: lot._id, // Include MongoDB _id
            internalID: lot.internalID || lot._id?.toString() || `lot_${Date.now()}`,
            slug: lot.slug || lot.product?.slug || `artwork-${lot._id}`,
            href: lot.href || `/artwork/${lot.slug || lot._id}`,
            title: lot.title || lot.product?.title || "Untitled Artwork",
            artistNames: lot.artistNames || lot.product?.artistNames || "Unknown Artist",
      image: {
              src: lot.image?.src || lot.product?.image?.[0] || "/placeholder.jpeg",
              width: lot.image?.width || 350,
              height: lot.image?.height || 240,
      },
      collectorSignals: {
        auction: {
          lotClosesAt: lot.collectorSignals?.auction?.lotClosesAt,
          registrationEndsAt: lot.collectorSignals?.auction?.registrationEndsAt,
        },
      },
      sale: {
              endAt: lot.sale?.endAt || lot.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isClosed: lot.sale?.isClosed || lot.status === "ENDED",
      },
      saleArtwork: {
        highestBid: {
                display: lot.saleArtwork?.highestBid?.display || lot.currentBid?.toString() || "$0",
        },
        openingBid: {
                display: lot.saleArtwork?.openingBid?.display || lot.startingBid?.toString() || "$0",
        },
      },
          };
        } catch (error) {
          console.error("Error formatting auction lot:", error, lot);
          return null;
        }
      })
      .filter(lot => lot !== null); // Remove any failed mappings

    console.log(`Successfully formatted ${formattedAuctionLots.length} auction lots`);

    // Send formatted data as JSON
    res.status(200).json({ auctionLots: formattedAuctionLots });
  } catch (error) {
    console.error("Error fetching auction lots from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch auction lots", details: error.message });
  } finally {
    // Ensure connection is closed
    if (client) {
      await client.close();
    }
  }
}