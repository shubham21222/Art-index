import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGODB_URI;
  const dbName = 'test';

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  const { id, category } = req.body;

  console.log('Delete request received:', { id, category });

  if (!id) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Determine which collection to delete from based on category
    let collectionName = 'galleries'; // default
    let queryField = 'internalID';

    if (category) {
      // Map categories to their respective collections
      const categoryToCollection = {
        'Graffiti & Street Art': 'graffiti_street_art_artworks',
        'Photography': 'photography_artworks',
        'Contemporary Design': 'contemporary_design',
        'Modern': 'modern_artworks',
        'Middle Eastern Art': 'middle_eastern_artworks',
        'Emerging Art': 'emerging_artworks',
        'Drawings': 'drawings_artworks',
        'South Asian & Southeast Asian Art': 'south_asian_southeast_asian_artworks',
        'Eastern European Art': 'eastern_european_artworks',
        'Pop Art': 'pop_art_artworks',
        'Ancient Art & Antiquities': 'ancient_art_artworks',
        'Indian Art': 'indian_art_artworks',
        'Ceramics': 'ceramics_artworks',
        'Old Masters': 'old_masters_artworks',
        'New Media & Video': 'film_video_artworks',
        'Museums': 'museums',
        'University Museums': 'university_museums',
        'Nonprofit Organizations': 'nonprofit_organizations',
        'Artist Estates': 'artist_estates',
        'Private Collections': 'private_collections',
        'Historical Art': 'historical_art_institutions',
        'Modern & Contemporary Art': 'modern_contemporary_artworks',
        'Outdoor Art': 'outdoor_art_institutions',
        'Shows': 'shows'
      };

      collectionName = categoryToCollection[category] || 'galleries';
    }

    const collection = db.collection(collectionName);

    // Try to find the item by MongoDB _id first, then by internalID as fallback
    console.log(`Searching in collection: ${collectionName}`);
    console.log(`Looking for item with MongoDB _id: ${id}`);
    
    let item = await collection.findOne({ _id: id });
    if (!item) {
      // Try as ObjectId if it looks like a valid ObjectId
      try {
        if (ObjectId.isValid(id)) {
          console.log(`Trying as ObjectId: ${id}`);
          item = await collection.findOne({ _id: new ObjectId(id) });
        }
      } catch (error) {
        console.log('Error converting to ObjectId:', error);
      }
    }
    
    if (!item) {
      console.log(`Item not found by _id, trying internalID as fallback: ${id}`);
      item = await collection.findOne({ internalID: id });
      if (!item) {
        console.log('Item not found by internalID either');
        return res.status(404).json({ error: "Item not found" });
      }
      queryField = 'internalID';
    } else {
      queryField = '_id';
    }
    
    console.log('Item found:', item);

    // Perform the deletion
    const result = await collection.deleteOne({ [queryField]: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found or already deleted" });
    }

    res.status(200).json({
      message: "Item deleted successfully",
      deletedCount: result.deletedCount,
      deletedItem: item
    });

  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ error: "Failed to delete item", details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 