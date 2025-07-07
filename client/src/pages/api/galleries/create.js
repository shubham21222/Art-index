import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGODB_URI;
  const dbName = 'test';

  if (!uri || !dbName) {
    return res.status(500).json({ error: "Missing MongoDB configuration" });
  }

  const { itemData, category } = req.body;

  if (!itemData) {
    return res.status(400).json({ error: "Item data is required" });
  }

  if (!itemData.name && !itemData.title) {
    return res.status(400).json({ error: "Item name/title is required" });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Determine which collection to insert into based on category
    let collectionName = 'galleries'; // default

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

    // Prepare the new item data
    const newItem = {
      internalID: `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: itemData.name || itemData.title,
      artistNames: itemData.artistNames || itemData.artist || 'Unknown Artist',
      date: itemData.date || new Date().toISOString().split('T')[0],
      image: {
        src: itemData.image || '/placeholder.jpeg',
        width: itemData.imageWidth || 445,
        height: itemData.imageHeight || 534,
      },
      partner: {
        name: itemData.partner?.name || itemData.gallery || 'Unknown Gallery',
        href: itemData.partner?.href || '#',
      },
      saleMessage: itemData.saleMessage || 'Price on request',
      culturalMaker: itemData.culturalMaker || null,
      collectingInstitution: itemData.collectingInstitution || null,
      attributionClass: itemData.attributionClass || null,
      mediumType: itemData.mediumType || itemData.medium || null,
      slug: itemData.slug || `item-${Date.now()}`,
      href: itemData.href || `/artwork/item-${Date.now()}`,
      locations: itemData.locations || [],
      categories: itemData.categories || [category],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add category-specific fields
    if (category === 'Museums' || category === 'University Museums' || 
        category === 'Nonprofit Organizations' || category === 'Artist Estates' || 
        category === 'Private Collections' || category === 'Historical Art' || 
        category === 'Modern & Contemporary Art' || category === 'Outdoor Art') {
      newItem.name = itemData.name || itemData.title;
      newItem.initials = itemData.initials || (itemData.name || itemData.title).substring(0, 2).toUpperCase();
      newItem.type = itemData.type || 'institution';
      newItem.profile = {
        image: {
          src: itemData.image || '/placeholder.jpeg',
          width: 445,
          height: 334,
        }
      };
    }

    // Insert the new item
    const result = await collection.insertOne(newItem);

    if (!result.insertedId) {
      return res.status(500).json({ error: "Failed to create item" });
    }

    // Fetch the created item
    const createdItem = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Item created successfully",
      item: createdItem,
      insertedId: result.insertedId
    });

  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(500).json({ error: "Failed to create item", details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 