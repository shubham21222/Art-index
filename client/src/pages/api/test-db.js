import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const dbName = "test";

  if (!uri) {
    return res.status(500).json({ 
      error: "MONGODB_URI environment variable is not set",
      envVars: {
        MONGODB_URI: "missing",
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });
  }

  let client;

  try {
    // Test connection
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    
    // Test collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Test specific collections
    const galleriesCount = await db.collection("galleries").countDocuments();
    const auctionsCount = await db.collection("auctions").countDocuments();
    
    res.status(200).json({
      success: true,
      connection: "Connected to MongoDB successfully",
      database: dbName,
      collections: collectionNames,
      counts: {
        galleries: galleriesCount,
        auctions: auctionsCount
      },
      envVars: {
        MONGODB_URI: uri ? "set" : "missing",
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({ 
      error: "Failed to connect to MongoDB",
      details: error.message,
      envVars: {
        MONGODB_URI: uri ? "set" : "missing",
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 