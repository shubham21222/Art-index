import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, category } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

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

    // Map categories to their respective collections
    const categoryToCollection = {
      "Graffiti & Street Art": "graffiti_street_art_artworks",
      "Photography": "photography_artworks",
      "Contemporary Design": "contemporary_design",
      "Modern": "modern_artworks",
      "Middle Eastern Art": "middle_eastern_art_artworks",
      "Emerging Art": "emerging_art_artworks",
      "Drawings": "drawings_artworks",
      "South Asian & Southeast Asian Art": "south_asian_southeast_asian_art_artworks",
      "Eastern European Art": "eastern_european_art_artworks",
      "Pop Art": "pop_art_artworks",
      "Ancient Art & Antiquities": "ancient_art_antiquities_artworks",
      "Indian Art": "indian_art_artworks",
      "Ceramics": "ceramics_artworks",
      "Old Masters": "old_masters_artworks",
      "New Media & Video": "new_media_video_artworks",
      "Outdoor Art": "outdoor_art_institutions",
      "Historical Art": "historical_art_institutions",
      "Modern & Contemporary Art": "modern_contemporary_art_institutions",
      "Trending Artists": "trending_artists",
      "Artist Estates": "artist_estates_institutions",
      "Museums": "museums_institutions",
      "University Museums": "university_museums_institutions",
      "Nonprofit Organizations": "nonprofit_organizations"
    };

    const collectionName = categoryToCollection[category];
    
    if (!collectionName) {
      return res.status(400).json({ error: `Unknown category: ${category}` });
    }

    const collection = db.collection(collectionName);

    // Convert string ID to ObjectId if needed
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }

    // Try to find the item first
    const item = await collection.findOne({ _id: objectId });
    
    if (!item) {
      console.log(`Item not found in collection ${collectionName} with _id: ${id}`);
      return res.status(404).json({ error: 'Item not found or already deleted' });
    }

    console.log(`Found item in ${collectionName}:`, item.title || item.name);

    // Delete the item
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found or already deleted' });
    }

    console.log(`Successfully deleted item from ${collectionName} with _id: ${id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Item deleted successfully',
      deletedId: id,
      category: category,
      collection: collectionName
    });

  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ error: 'Failed to delete item', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 