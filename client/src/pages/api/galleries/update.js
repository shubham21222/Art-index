import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGODB_URI;
  const dbName = 'test';

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  const { id, updates, category } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Update data is required" });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Determine which collection to update based on category
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
    let item = await collection.findOne({ _id: id });
    if (!item) {
      // Try as ObjectId if it looks like a valid ObjectId
      try {
        if (ObjectId.isValid(id)) {
          item = await collection.findOne({ _id: new ObjectId(id) });
        }
      } catch (error) {
        console.log('Error converting to ObjectId:', error);
      }
    }
    
    if (!item) {
      item = await collection.findOne({ internalID: id });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      queryField = 'internalID';
    } else {
      queryField = '_id';
    }

    // Prepare update data
    const updateData = {};
    
    // Map frontend field names to database field names
    if (updates.name) updateData.title = updates.name;
    if (updates.title) updateData.title = updates.title;
    if (updates.artistNames) updateData.artistNames = updates.artistNames;
    if (updates.artist) updateData.artistNames = updates.artist;
    if (updates.saleMessage) updateData.saleMessage = updates.saleMessage;
    if (updates.date) updateData.date = updates.date;
    if (updates.medium) updateData.mediumType = updates.medium;
    if (updates.image) updateData.image = updates.image;
    if (updates.partner) updateData.partner = updates.partner;
    if (updates.locations) updateData.locations = updates.locations;
    if (updates.collectingInstitution) updateData.collectingInstitution = updates.collectingInstitution;
    if (updates.culturalMaker) updateData.culturalMaker = updates.culturalMaker;
    if (updates.attributionClass) updateData.attributionClass = updates.attributionClass;
    if (updates.slug) updateData.slug = updates.slug;
    if (updates.href) updateData.href = updates.href;

    // Add timestamp
    updateData.updatedAt = new Date();

    // Perform the update
    const result = await collection.updateOne(
      { [queryField]: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes made", item });
    }

    // Fetch the updated item
    const updatedItem = await collection.findOne({ [queryField]: id });

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error updating gallery item:", error);
    res.status(500).json({ error: "Failed to update item", details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 