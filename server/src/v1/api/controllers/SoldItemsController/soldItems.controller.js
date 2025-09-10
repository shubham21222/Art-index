import GalleryModel from '../../models/Gallery/gallery.model.js';
import { success, notFound, badRequest, unknownError } from '../../formatters/globalResponse.js';
import mongoose from 'mongoose';

// Get all sold artworks across all galleries
export const getAllSoldArtworks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'sold' } = req.query;
    const skip = (page - 1) * limit;

    let soldArtworks = [];

    // Get artworks from Gallery collections
    const galleries = await GalleryModel.find({
      'artworks.soldStatus': status
    }).populate('createdBy', 'name email');

    galleries.forEach(gallery => {
      gallery.artworks.forEach(artwork => {
        if (artwork.soldStatus === status) {
          soldArtworks.push({
            ...artwork.toObject(),
            galleryId: gallery._id,
            galleryTitle: gallery.title,
            galleryOwner: gallery.createdBy,
            source: 'gallery'
          });
        }
      });
    });

    // Get artworks from separate artwork collections
    const db = mongoose.connection.db;
    
    if (!db) {
      console.error('Database connection not available in getAllSoldArtworks');
      return unknownError(res, 'Database connection not available');
    }
    
    const artworkCollections = [
      'graffiti_street_art_artworks',
      'photography_artworks',
      'contemporary_design',
      'modern_artworks',
      'middle_eastern_art_artworks',
      'emerging_art_artworks',
      'drawings_artworks',
      'south_asian_southeast_asian_art_artworks',
      'eastern_european_art_artworks',
      'pop_art_artworks',
      'ancient_art_antiquities_artworks',
      'indian_art_artworks',
      'ceramics_artworks',
      'old_masters_artworks',
      'new_media_video_artworks'
    ];

    for (const collectionName of artworkCollections) {
      try {
        console.log(`Processing collection for sold artworks: ${collectionName}`);
        const collection = db.collection(collectionName);
        const artworks = await collection.find({ soldStatus: status }).toArray();
        console.log(`Found ${artworks.length} ${status} artworks in ${collectionName}`);
        
        artworks.forEach(artwork => {
          soldArtworks.push({
            ...artwork,
            galleryId: null,
            galleryTitle: artwork.partner?.name || 'Unknown Gallery',
            galleryOwner: null,
            source: 'collection',
            collectionName: collectionName
          });
        });
      } catch (error) {
        console.log(`Collection ${collectionName} not found or error:`, error.message);
        // Continue with other collections
      }
    }

    // Sort by sold date (newest first)
    soldArtworks.sort((a, b) => new Date(b.soldAt || b.createdAt) - new Date(a.soldAt || a.createdAt));

    // Apply pagination
    const total = soldArtworks.length;
    const paginatedArtworks = soldArtworks.slice(skip, skip + parseInt(limit));

    return success(res, `Found ${total} sold artworks`, {
      artworks: paginatedArtworks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Mark artwork as sold
export const markArtworkAsSold = async (req, res) => {
  try {
    const { galleryId, artworkId } = req.params;
    const { soldPrice, soldTo, soldNotes } = req.body;

    if (!soldPrice) {
      return badRequest(res, "Sold price is required");
    }

    const gallery = await GalleryModel.findById(galleryId);
    if (!gallery) {
      return notFound(res, "Gallery not found");
    }

    const artworkIndex = gallery.artworks.findIndex(
      artwork => artwork._id.toString() === artworkId
    );

    if (artworkIndex === -1) {
      return notFound(res, "Artwork not found");
    }

    // Update artwork sold status
    gallery.artworks[artworkIndex].soldStatus = 'sold';
    gallery.artworks[artworkIndex].soldAt = new Date();
    gallery.artworks[artworkIndex].soldPrice = soldPrice;
    gallery.artworks[artworkIndex].soldTo = soldTo || null;
    gallery.artworks[artworkIndex].soldBy = req.user._id;
    gallery.artworks[artworkIndex].soldNotes = soldNotes || '';

    await gallery.save();

    return success(res, "Artwork marked as sold successfully", {
      artwork: gallery.artworks[artworkIndex],
      gallery: {
        id: gallery._id,
        title: gallery.title
      }
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Mark artwork as available (unsold)
export const markArtworkAsAvailable = async (req, res) => {
  try {
    const { galleryId, artworkId } = req.params;

    const gallery = await GalleryModel.findById(galleryId);
    if (!gallery) {
      return notFound(res, "Gallery not found");
    }

    const artworkIndex = gallery.artworks.findIndex(
      artwork => artwork._id.toString() === artworkId
    );

    if (artworkIndex === -1) {
      return notFound(res, "Artwork not found");
    }

    // Reset artwork sold status
    gallery.artworks[artworkIndex].soldStatus = 'available';
    gallery.artworks[artworkIndex].soldAt = null;
    gallery.artworks[artworkIndex].soldPrice = null;
    gallery.artworks[artworkIndex].soldTo = null;
    gallery.artworks[artworkIndex].soldBy = null;
    gallery.artworks[artworkIndex].soldNotes = '';

    await gallery.save();

    return success(res, "Artwork marked as available successfully", {
      artwork: gallery.artworks[artworkIndex],
      gallery: {
        id: gallery._id,
        title: gallery.title
      }
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Mark artwork as reserved
export const markArtworkAsReserved = async (req, res) => {
  try {
    const { galleryId, artworkId } = req.params;
    const { soldNotes } = req.body;

    const gallery = await GalleryModel.findById(galleryId);
    if (!gallery) {
      return notFound(res, "Gallery not found");
    }

    const artworkIndex = gallery.artworks.findIndex(
      artwork => artwork._id.toString() === artworkId
    );

    if (artworkIndex === -1) {
      return notFound(res, "Artwork not found");
    }

    // Update artwork reserved status
    gallery.artworks[artworkIndex].soldStatus = 'reserved';
    gallery.artworks[artworkIndex].soldBy = req.user._id;
    gallery.artworks[artworkIndex].soldNotes = soldNotes || '';

    await gallery.save();

    return success(res, "Artwork marked as reserved successfully", {
      artwork: gallery.artworks[artworkIndex],
      gallery: {
        id: gallery._id,
        title: gallery.title
      }
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

// Get sold artworks statistics
export const getSoldArtworksStats = async (req, res) => {
  try {
    console.log('Starting stats calculation...');
    const db = mongoose.connection.db;
    
    if (!db) {
      console.error('Database connection not available');
      return unknownError(res, 'Database connection not available');
    }

    let stats = {
      totalArtworks: 0,
      soldArtworks: 0,
      reservedArtworks: 0,
      availableArtworks: 0,
      totalSoldValue: 0,
      averageSoldPrice: 0,
      soldByMonth: {},
      soldByCategory: {}
    };

    // Get stats from Gallery artworks
    const galleries = await GalleryModel.find({});
    galleries.forEach(gallery => {
      gallery.artworks.forEach(artwork => {
        stats.totalArtworks++;
        
        switch (artwork.soldStatus) {
          case 'sold':
            stats.soldArtworks++;
            if (artwork.soldPrice) {
              stats.totalSoldValue += parseFloat(artwork.soldPrice) || 0;
            }
            
            // Group by month
            if (artwork.soldAt) {
              const month = new Date(artwork.soldAt).toISOString().substring(0, 7);
              stats.soldByMonth[month] = (stats.soldByMonth[month] || 0) + 1;
            }
            
            // Group by category
            stats.soldByCategory[artwork.category] = (stats.soldByCategory[artwork.category] || 0) + 1;
            break;
          case 'reserved':
            stats.reservedArtworks++;
            break;
          case 'available':
            stats.availableArtworks++;
            break;
        }
      });
    });

    // Get stats from separate artwork collections
    const artworkCollections = [
      'graffiti_street_art_artworks',
      'photography_artworks',
      'contemporary_design',
      'modern_artworks',
      'middle_eastern_art_artworks',
      'emerging_art_artworks',
      'drawings_artworks',
      'south_asian_southeast_asian_art_artworks',
      'eastern_european_art_artworks',
      'pop_art_artworks',
      'ancient_art_antiquities_artworks',
      'indian_art_artworks',
      'ceramics_artworks',
      'old_masters_artworks',
      'new_media_video_artworks'
    ];

    for (const collectionName of artworkCollections) {
      try {
        console.log(`Processing collection: ${collectionName}`);
        const collection = db.collection(collectionName);
        const artworks = await collection.find({}).toArray();
        console.log(`Found ${artworks.length} artworks in ${collectionName}`);
        
        artworks.forEach(artwork => {
          stats.totalArtworks++;
          
          switch (artwork.soldStatus) {
            case 'sold':
              stats.soldArtworks++;
              if (artwork.soldPrice) {
                stats.totalSoldValue += parseFloat(artwork.soldPrice) || 0;
              }
              
              // Group by month
              if (artwork.soldAt) {
                const month = new Date(artwork.soldAt).toISOString().substring(0, 7);
                stats.soldByMonth[month] = (stats.soldByMonth[month] || 0) + 1;
              }
              
              // Group by category
              const category = artwork.category || 'Unknown';
              stats.soldByCategory[category] = (stats.soldByCategory[category] || 0) + 1;
              break;
            case 'reserved':
              stats.reservedArtworks++;
              break;
            case 'available':
              stats.availableArtworks++;
              break;
            default:
              // If no soldStatus field, count as available
              stats.availableArtworks++;
              break;
          }
        });
      } catch (error) {
        console.log(`Collection ${collectionName} not found or error:`, error.message);
        // Continue with other collections
      }
    }

    stats.averageSoldPrice = stats.soldArtworks > 0 ? stats.totalSoldValue / stats.soldArtworks : 0;

    console.log('Final stats:', stats);
    return success(res, "Sold artworks statistics retrieved successfully", stats);
  } catch (error) {
    console.error('Error in getSoldArtworksStats:', error);
    return unknownError(res, error.message);
  }
};

// Bulk mark artworks as sold
export const bulkMarkAsSold = async (req, res) => {
  try {
    const { artworkIds, soldPrice, soldTo, soldNotes } = req.body;

    if (!artworkIds || !Array.isArray(artworkIds) || artworkIds.length === 0) {
      return badRequest(res, "Artwork IDs array is required");
    }

    if (!soldPrice) {
      return badRequest(res, "Sold price is required");
    }

    const results = [];
    const errors = [];

    for (const artworkId of artworkIds) {
      try {
        // Find gallery containing this artwork
        const gallery = await GalleryModel.findOne({
          'artworks._id': artworkId
        });

        if (!gallery) {
          errors.push({ artworkId, error: "Gallery not found" });
          continue;
        }

        const artworkIndex = gallery.artworks.findIndex(
          artwork => artwork._id.toString() === artworkId
        );

        if (artworkIndex === -1) {
          errors.push({ artworkId, error: "Artwork not found" });
          continue;
        }

        // Update artwork sold status
        gallery.artworks[artworkIndex].soldStatus = 'sold';
        gallery.artworks[artworkIndex].soldAt = new Date();
        gallery.artworks[artworkIndex].soldPrice = soldPrice;
        gallery.artworks[artworkIndex].soldTo = soldTo || null;
        gallery.artworks[artworkIndex].soldBy = req.user._id;
        gallery.artworks[artworkIndex].soldNotes = soldNotes || '';

        await gallery.save();

        results.push({
          artworkId,
          artwork: gallery.artworks[artworkIndex],
          gallery: {
            id: gallery._id,
            title: gallery.title
          }
        });
      } catch (error) {
        errors.push({ artworkId, error: error.message });
      }
    }

    return success(res, `Processed ${artworkIds.length} artworks`, {
      successful: results,
      errors: errors,
      summary: {
        total: artworkIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};
