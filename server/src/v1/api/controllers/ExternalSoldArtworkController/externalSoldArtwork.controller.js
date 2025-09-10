import ExternalSoldArtwork from '../../models/ExternalSoldArtwork/externalSoldArtwork.model.js';
import { success, notFound, badRequest, unknownError } from '../../formatters/globalResponse.js';

// Update external artwork sold status
export const updateExternalArtworkStatus = async (req, res) => {
  try {
    const { id, category, updates } = req.body;
    
    if (!id) {
      return badRequest(res, "Artwork ID is required");
    }

    if (!updates) {
      return badRequest(res, "Updates are required");
    }

    // Extract artsyId from the id (it might be in format like "U2VhcmNoYWJsZUl0ZW06NjFlYjMxMWNlNzE3MjkwMDBkYTI0OTA1")
    let artsyId = id;
    if (id.includes(':')) {
      artsyId = id.split(':')[1];
    }

    // Check if this external artwork already exists in our database
    let externalArtwork = await ExternalSoldArtwork.findOne({ artsyId });

    if (!externalArtwork) {
      // Create new external artwork record
      externalArtwork = new ExternalSoldArtwork({
        artsyId: artsyId,
        slug: updates.slug || '',
        title: updates.name || updates.title || 'Unknown Artwork',
        artistName: updates.artist || updates.artistName || updates.artistNames || 'Unknown Artist',
        imageUrl: updates.image || updates.imageUrl || '',
        href: updates.href || '',
        soldStatus: updates.soldStatus || 'available',
        soldPrice: updates.soldPrice ? parseFloat(updates.soldPrice) : null,
        soldTo: updates.soldTo || '',
        soldNotes: updates.soldNotes || '',
        soldAt: updates.soldStatus === 'sold' ? new Date() : null,
        soldBy: req.user?._id || null,
        category: category || 'External Artwork',
        displayType: 'Artwork'
      });
    } else {
      // Update existing record
      externalArtwork.soldStatus = updates.soldStatus || externalArtwork.soldStatus;
      externalArtwork.soldPrice = updates.soldPrice ? parseFloat(updates.soldPrice) : externalArtwork.soldPrice;
      externalArtwork.soldTo = updates.soldTo || externalArtwork.soldTo;
      externalArtwork.soldNotes = updates.soldNotes || externalArtwork.soldNotes;
      externalArtwork.soldAt = updates.soldStatus === 'sold' ? new Date() : externalArtwork.soldAt;
      externalArtwork.soldBy = req.user?._id || externalArtwork.soldBy;
      
      // Update basic info if provided
      if (updates.name || updates.title) externalArtwork.title = updates.name || updates.title;
      if (updates.artist || updates.artistName) externalArtwork.artistName = updates.artist || updates.artistName;
      if (updates.image || updates.imageUrl) externalArtwork.imageUrl = updates.image || updates.imageUrl;
    }

    await externalArtwork.save();

    return success(res, "External artwork status updated successfully", {
      artwork: externalArtwork,
      message: `Artwork "${externalArtwork.title}" marked as ${externalArtwork.soldStatus}`
    });

  } catch (error) {
    console.error('Error updating external artwork:', error);
    return unknownError(res, error.message);
  }
};

// Get external artwork sold status by artsyId or slug
export const getExternalArtworkStatus = async (req, res) => {
  try {
    const { artsyId, slug } = req.query;
    
    if (!artsyId && !slug) {
      return badRequest(res, "Either artsyId or slug is required");
    }

    let query = {};
    if (artsyId) {
      query.artsyId = artsyId;
    }
    if (slug) {
      query.slug = slug;
    }

    const externalArtwork = await ExternalSoldArtwork.findOne(query);

    if (!externalArtwork) {
      return success(res, "External artwork not found in custom records", {
        soldStatus: 'available',
        isExternal: true
      });
    }

    return success(res, "External artwork status retrieved successfully", {
      artwork: externalArtwork,
      soldStatus: externalArtwork.soldStatus,
      isExternal: true
    });

  } catch (error) {
    console.error('Error getting external artwork status:', error);
    return unknownError(res, error.message);
  }
};

// Get all external sold artworks
export const getAllExternalSoldArtworks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'sold' } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { soldStatus: status } : {};
    
    const externalArtworks = await ExternalSoldArtwork.find(query)
      .sort({ soldAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('soldBy', 'name email');

    const total = await ExternalSoldArtwork.countDocuments(query);

    return success(res, `Found ${total} external ${status} artworks`, {
      artworks: externalArtworks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error getting external sold artworks:', error);
    return unknownError(res, error.message);
  }
};

// Delete external artwork record
export const deleteExternalArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return badRequest(res, "Artwork ID is required");
    }

    // Extract artsyId from the id
    let artsyId = id;
    if (id.includes(':')) {
      artsyId = id.split(':')[1];
    }

    const externalArtwork = await ExternalSoldArtwork.findOneAndDelete({ artsyId });

    if (!externalArtwork) {
      return notFound(res, "External artwork not found");
    }

    return success(res, "External artwork deleted successfully", {
      deletedArtwork: externalArtwork
    });

  } catch (error) {
    console.error('Error deleting external artwork:', error);
    return unknownError(res, error.message);
  }
};

// Get external artwork statistics
export const getExternalArtworkStats = async (req, res) => {
  try {
    const totalSold = await ExternalSoldArtwork.countDocuments({ soldStatus: 'sold' });
    const totalReserved = await ExternalSoldArtwork.countDocuments({ soldStatus: 'reserved' });
    const totalAvailable = await ExternalSoldArtwork.countDocuments({ soldStatus: 'available' });
    const totalArtworks = await ExternalSoldArtwork.countDocuments();

    const stats = {
      totalSold,
      totalReserved,
      totalAvailable,
      totalArtworks,
      soldPercentage: totalArtworks > 0 ? Math.round((totalSold / totalArtworks) * 100) : 0
    };

    return success(res, "External artwork statistics retrieved successfully", stats);

  } catch (error) {
    console.error('Error getting external artwork stats:', error);
    return unknownError(res, error.message);
  }
};
