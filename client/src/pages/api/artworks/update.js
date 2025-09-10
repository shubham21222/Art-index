import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, category, updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Updates object is required' });
  }

  // Check if this is an external artwork (from Artsy API)
  const isExternalArtwork = updates.__typename || updates.displayType || id.includes('U2VhcmNoYWJsZUl0ZW0') || id.includes('search-');
  
  if (isExternalArtwork) {
    // Handle external artwork - forward to server API
    try {
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
      const serverEndpoint = `${serverUrl}/artworks/update`;
      
      console.log('Forwarding external artwork update to:', serverEndpoint);
      console.log('Request payload:', { id, category: category || 'Artwork', updates });
      
      // Prepare headers for server request
      const serverHeaders = {
        'Content-Type': 'application/json',
      };
      
      // Forward authentication header if present
      if (req.headers.authorization) {
        serverHeaders['Authorization'] = req.headers.authorization;
      }
      
      const serverResponse = await fetch(serverEndpoint, {
        method: 'PUT',
        headers: serverHeaders,
        body: JSON.stringify({
          id,
          category: category || 'Artwork',
          updates
        })
      });

      const data = await serverResponse.json();
      console.log('Server response:', { status: serverResponse.status, data });

      if (!serverResponse.ok) {
        console.error('Server error response:', data);
        return res.status(serverResponse.status).json({ 
          error: data.error || 'Failed to update external artwork',
          details: data.details || 'Unknown server error'
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error updating external artwork:', error);
      return res.status(500).json({ 
        error: 'Failed to update external artwork', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Handle local database artwork (existing logic)
  if (!category) {
    return res.status(400).json({ error: 'Category is required for local artworks' });
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
    const existingItem = await collection.findOne({ _id: objectId });
    
    if (!existingItem) {
      console.log(`Item not found in collection ${collectionName} with _id: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log(`Found item in ${collectionName}:`, existingItem.title || existingItem.name);

    // Prepare update object based on the item type
    let updateObject = {};
    
    // Handle different field mappings based on item type
    if (updates.name) {
      updateObject.title = updates.name;
    }
    if (updates.artist) {
      updateObject.artistNames = updates.artist;
    }
    if (updates.gallery) {
      updateObject.partner = { name: updates.gallery };
    }
    if (updates.medium) {
      updateObject.mediumType = updates.medium;
    }
    if (updates.date) {
      updateObject.date = updates.date;
    }
    if (updates.saleMessage) {
      updateObject.saleMessage = updates.saleMessage;
    }
    if (updates.image) {
      // Handle image update based on the collection type
      if (collectionName.includes('institutions') || collectionName === 'contemporary_design') {
        updateObject.profile = { image: { cropped: { src: updates.image } } };
      } else {
        // For artwork collections, store just the URL string
        updateObject.image = updates.image;
      }
    }
    
    // Handle sold status updates
    if (updates.soldStatus) {
      updateObject.soldStatus = updates.soldStatus;
      if (updates.soldStatus === 'sold') {
        updateObject.soldAt = new Date();
        updateObject.soldPrice = updates.soldPrice || null;
        updateObject.soldTo = updates.soldTo || null;
        updateObject.soldNotes = updates.soldNotes || '';
      } else if (updates.soldStatus === 'available') {
        updateObject.soldAt = null;
        updateObject.soldPrice = null;
        updateObject.soldTo = null;
        updateObject.soldNotes = '';
      }
    }

    // Update the item
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateObject }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No changes made',
        item: existingItem
      });
    }

    // Get the updated item
    const updatedItem = await collection.findOne({ _id: objectId });

    console.log(`Successfully updated item in ${collectionName} with _id: ${id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Item updated successfully',
      item: updatedItem,
      category: category,
      collection: collectionName
    });

  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(500).json({ error: 'Failed to update item', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 