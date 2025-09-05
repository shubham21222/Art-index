import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError,
    isValidObjectId
} from "../../formatters/globalResponse.js";
import { ArtworkPricing, GlobalPricingAdjustment } from "../../models/ArtworkPricing/artworkPricing.model.js";

// Helper function to calculate cumulative adjustment percentage
const calculateCumulativeAdjustment = (originalPrice, adjustedPrice) => {
    return ((adjustedPrice / originalPrice) - 1) * 100;
};

// Create or update artwork pricing
export const createOrUpdateArtworkPricing = async (req, res) => {
    try {
        const {
            artworkId,
            artworkSlug,
            originalPrice,
            originalPriceType,
            originalMinPrice,
            originalMaxPrice,
            adjustmentPercentage,
            adjustmentReason,
            artworkTitle,
            artistName,
            category
        } = req.body;

        // Validate required fields
        if (!artworkId || !artworkSlug || !originalPrice || !originalPriceType || 
            !artworkTitle || !artistName) {
            return badRequest(res, "Missing required fields");
        }

        // Validate adjustment percentage
        if (adjustmentPercentage === undefined || adjustmentPercentage === null) {
            return badRequest(res, "Adjustment percentage is required");
        }

        // Calculate adjusted price
        let adjustedPrice, adjustedPriceType, adjustedMinPrice, adjustedMaxPrice;

        if (originalPriceType === 'Money') {
            adjustedPrice = originalPrice * (1 + adjustmentPercentage / 100);
            adjustedPriceType = 'Money';
        } else if (originalPriceType === 'PriceRange') {
            if (originalMinPrice && originalMaxPrice) {
                adjustedMinPrice = originalMinPrice * (1 + adjustmentPercentage / 100);
                adjustedMaxPrice = originalMaxPrice * (1 + adjustmentPercentage / 100);
                adjustedPrice = (adjustedMinPrice + adjustedMaxPrice) / 2; // Average for display
                adjustedPriceType = 'PriceRange';
            } else {
                return badRequest(res, "Min and max prices are required for price range");
            }
        } else {
            return badRequest(res, "Invalid price type");
        }

        // Check if pricing already exists
        const existingPricing = await ArtworkPricing.findOne({ artworkId });

        if (existingPricing) {
            // Update existing pricing
            const updatedPricing = await ArtworkPricing.findByIdAndUpdate(
                existingPricing._id,
                {
                    originalPrice,
                    originalPriceType,
                    originalMinPrice,
                    originalMaxPrice,
                    adjustedPrice,
                    adjustedPriceType,
                    adjustedMinPrice,
                    adjustedMaxPrice,
                    adjustmentPercentage,
                    adjustmentReason,
                    artworkTitle,
                    artistName,
                    category,
                    updatedBy: req.user._id,
                    isActive: true
                },
                { new: true }
            );

            return success(res, "Artwork pricing updated successfully", updatedPricing);
        } else {
            // Create new pricing
            const newPricing = new ArtworkPricing({
                artworkId,
                artworkSlug,
                originalPrice,
                originalPriceType,
                originalMinPrice,
                originalMaxPrice,
                adjustedPrice,
                adjustedPriceType,
                adjustedMinPrice,
                adjustedMaxPrice,
                adjustmentPercentage,
                adjustmentReason,
                artworkTitle,
                artistName,
                category,
                createdBy: req.user._id,
                updatedBy: req.user._id
            });

            const savedPricing = await newPricing.save();
            return created(res, "Artwork pricing created successfully", savedPricing);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Create global pricing adjustment
export const createGlobalPricingAdjustment = async (req, res) => {
    try {
        const {
            adjustmentPercentage,
            adjustmentReason,
            appliedToCategories = [],
            appliedToArtists = [],
            excludeArtworks = []
        } = req.body;

        // Validate required fields
        if (adjustmentPercentage === undefined || adjustmentPercentage === null) {
            return badRequest(res, "Adjustment percentage is required");
        }

        if (!adjustmentReason) {
            return badRequest(res, "Adjustment reason is required");
        }

        // Deactivate any existing global adjustments
        await GlobalPricingAdjustment.updateMany(
            { isActive: true },
            { isActive: false, updatedBy: req.user._id }
        );

        // Create new global adjustment
        const globalAdjustment = new GlobalPricingAdjustment({
            adjustmentPercentage,
            adjustmentReason,
            appliedToCategories,
            appliedToArtists,
            excludeArtworks,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        const savedAdjustment = await globalAdjustment.save();

        // Apply the adjustment to all existing artwork pricing
        await applyGlobalAdjustmentToAllArtworks(savedAdjustment);

        return created(res, "Global pricing adjustment created and applied successfully", savedAdjustment);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Apply global adjustment to all artworks
const applyGlobalAdjustmentToAllArtworks = async (globalAdjustment) => {
    try {
        // Build query based on filters
        let query = { isActive: true };
        
        if (globalAdjustment.appliedToCategories.length > 0) {
            query.category = { $in: globalAdjustment.appliedToCategories };
        }
        
        if (globalAdjustment.appliedToArtists.length > 0) {
            query.artistName = { $in: globalAdjustment.appliedToArtists };
        }
        
        if (globalAdjustment.excludeArtworks.length > 0) {
            query.artworkId = { $nin: globalAdjustment.excludeArtworks };
        }

        // Get all matching artwork pricing
        const allPricing = await ArtworkPricing.find(query);

        // Update each pricing record
        for (const pricing of allPricing) {
            let adjustedPrice, adjustedMinPrice, adjustedMaxPrice;

            // Determine the base price for calculation
            // If there's already an adjustment, use the current adjusted price as base
            // Otherwise, use the original price as base
            const basePrice = pricing.adjustmentPercentage !== 0 ? pricing.adjustedPrice : pricing.originalPrice;
            const baseMinPrice = pricing.adjustmentPercentage !== 0 ? pricing.adjustedMinPrice : pricing.originalMinPrice;
            const baseMaxPrice = pricing.adjustmentPercentage !== 0 ? pricing.adjustedMaxPrice : pricing.originalMaxPrice;

            if (pricing.originalPriceType === 'Money') {
                adjustedPrice = basePrice * (1 + globalAdjustment.adjustmentPercentage / 100);
            } else if (pricing.originalPriceType === 'PriceRange') {
                adjustedMinPrice = baseMinPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                adjustedMaxPrice = baseMaxPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                adjustedPrice = (adjustedMinPrice + adjustedMaxPrice) / 2;
            }

            // Calculate cumulative adjustment percentage
            const cumulativeAdjustmentPercentage = pricing.adjustmentPercentage !== 0 
                ? calculateCumulativeAdjustment(pricing.originalPrice, adjustedPrice)
                : globalAdjustment.adjustmentPercentage;

            await ArtworkPricing.findByIdAndUpdate(pricing._id, {
                adjustedPrice,
                adjustedMinPrice,
                adjustedMaxPrice,
                adjustmentPercentage: cumulativeAdjustmentPercentage,
                adjustmentReason: globalAdjustment.adjustmentReason,
                updatedBy: globalAdjustment.createdBy
            });
        }

        console.log(`Applied global adjustment to ${allPricing.length} artworks`);
    } catch (error) {
        console.error('Error applying global adjustment:', error);
        throw error;
    }
};

// Get current global pricing adjustment
export const getCurrentGlobalAdjustment = async (req, res) => {
    try {
        const globalAdjustment = await GlobalPricingAdjustment.findOne({ isActive: true });

        if (!globalAdjustment) {
            return notFound(res, "No active global pricing adjustment found");
        }

        return success(res, "Global pricing adjustment fetched successfully", globalAdjustment);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get artwork pricing by artwork ID or slug (with global adjustment applied)
export const getArtworkPricing = async (req, res) => {
    try {
        const { artworkId, artworkSlug } = req.query;

        if (!artworkId && !artworkSlug) {
            return badRequest(res, "Either artworkId or artworkSlug is required");
        }

        let query = { isActive: true };
        if (artworkId) {
            query.artworkId = artworkId;
        } else if (artworkSlug) {
            query.artworkSlug = artworkSlug;
        }

        const pricing = await ArtworkPricing.findOne(query);

        if (!pricing) {
            return notFound(res, "Artwork pricing not found");
        }

        // Check if there's a global adjustment that should be applied
        const globalAdjustment = await GlobalPricingAdjustment.findOne({ isActive: true });
        
        if (globalAdjustment) {
            // Check if this artwork should be affected by the global adjustment
            let shouldApplyGlobal = true;
            
            if (globalAdjustment.appliedToCategories.length > 0) {
                shouldApplyGlobal = globalAdjustment.appliedToCategories.includes(pricing.category);
            }
            
            if (shouldApplyGlobal && globalAdjustment.appliedToArtists.length > 0) {
                shouldApplyGlobal = globalAdjustment.appliedToArtists.includes(pricing.artistName);
            }
            
            if (shouldApplyGlobal && globalAdjustment.excludeArtworks.length > 0) {
                shouldApplyGlobal = !globalAdjustment.excludeArtworks.includes(pricing.artworkId);
            }

            if (shouldApplyGlobal) {
                // Apply global adjustment on-the-fly
                let adjustedPrice, adjustedMinPrice, adjustedMaxPrice;

                if (pricing.originalPriceType === 'Money') {
                    adjustedPrice = pricing.originalPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                } else if (pricing.originalPriceType === 'PriceRange') {
                    adjustedMinPrice = pricing.originalMinPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                    adjustedMaxPrice = pricing.originalMaxPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                    adjustedPrice = (adjustedMinPrice + adjustedMaxPrice) / 2;
                }

                const adjustedPricing = {
                    ...pricing.toObject(),
                    adjustedPrice,
                    adjustedMinPrice,
                    adjustedMaxPrice,
                    adjustmentPercentage: globalAdjustment.adjustmentPercentage,
                    adjustmentReason: globalAdjustment.adjustmentReason,
                    globalAdjustmentApplied: true
                };

                return success(res, "Artwork pricing fetched successfully", adjustedPricing);
            }
        }

        return success(res, "Artwork pricing fetched successfully", pricing);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all artwork pricing with pagination
export const getAllArtworkPricing = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            searchQuery,
            category,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let matchStage = { isActive: true };

        // Search filter
        if (searchQuery) {
            matchStage.$or = [
                { artworkTitle: { $regex: searchQuery, $options: "i" } },
                { artistName: { $regex: searchQuery, $options: "i" } },
                { artworkSlug: { $regex: searchQuery, $options: "i" } }
            ];
        }

        // Category filter
        if (category) {
            matchStage.category = { $regex: category, $options: "i" };
        }

        // Sort options
        let sortStage = {};
        if (sortBy === 'artworkTitle') {
            sortStage.artworkTitle = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'artistName') {
            sortStage.artistName = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'adjustedPrice') {
            sortStage.adjustedPrice = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'adjustmentPercentage') {
            sortStage.adjustmentPercentage = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortStage.createdAt = sortOrder === 'asc' ? 1 : -1;
        }

        const pricing = await ArtworkPricing.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdByUser"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "updatedBy",
                    foreignField: "_id",
                    as: "updatedByUser"
                }
            },
            {
                $project: {
                    artworkId: 1,
                    artworkSlug: 1,
                    originalPrice: 1,
                    originalPriceType: 1,
                    originalMinPrice: 1,
                    originalMaxPrice: 1,
                    adjustedPrice: 1,
                    adjustedPriceType: 1,
                    adjustedMinPrice: 1,
                    adjustedMaxPrice: 1,
                    adjustmentPercentage: 1,
                    adjustmentReason: 1,
                    artworkTitle: 1,
                    artistName: 1,
                    category: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    createdBy: { $arrayElemAt: ["$createdByUser.name", 0] },
                    updatedBy: { $arrayElemAt: ["$updatedByUser.name", 0] }
                }
            }
        ]);

        const total = await ArtworkPricing.countDocuments(matchStage);

        return success(res, "Artwork pricing fetched successfully", {
            items: pricing,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete artwork pricing (soft delete)
export const deleteArtworkPricing = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return badRequest(res, "Invalid pricing ID");
        }

        const pricing = await ArtworkPricing.findByIdAndUpdate(
            id,
            { 
                isActive: false,
                updatedBy: req.user._id
            },
            { new: true }
        );

        if (!pricing) {
            return notFound(res, "Artwork pricing not found");
        }

        return success(res, "Artwork pricing deleted successfully", pricing);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Reset artwork pricing to original (remove adjustment)
export const resetArtworkPricing = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return badRequest(res, "Invalid pricing ID");
        }

        const pricing = await ArtworkPricing.findById(id);

        if (!pricing) {
            return notFound(res, "Artwork pricing not found");
        }

        // Reset to original values
        const updatedPricing = await ArtworkPricing.findByIdAndUpdate(
            id,
            {
                adjustedPrice: pricing.originalPrice,
                adjustedPriceType: pricing.originalPriceType,
                adjustedMinPrice: pricing.originalMinPrice,
                adjustedMaxPrice: pricing.originalMaxPrice,
                adjustmentPercentage: 0,
                adjustmentReason: "Reset to original price",
                updatedBy: req.user._id
            },
            { new: true }
        );

        return success(res, "Artwork pricing reset successfully", updatedPricing);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Reset all artwork pricing to original (remove all adjustments)
export const resetAllArtworkPricing = async (req, res) => {
    try {
        const result = await ArtworkPricing.updateMany(
            { isActive: true },
            {
                adjustedPrice: "$originalPrice",
                adjustedPriceType: "$originalPriceType",
                adjustedMinPrice: "$originalMinPrice",
                adjustedMaxPrice: "$originalMaxPrice",
                adjustmentPercentage: 0,
                adjustmentReason: "Reset all to original prices",
                updatedBy: req.user._id
            }
        );

        // Also deactivate any global adjustments
        await GlobalPricingAdjustment.updateMany(
            { isActive: true },
            { isActive: false, updatedBy: req.user._id }
        );

        // Reset all artwork pricing to original values
        await ArtworkPricing.updateMany(
            { isActive: true },
            {
                adjustedPrice: '$originalPrice',
                adjustedMinPrice: '$originalMinPrice',
                adjustedMaxPrice: '$originalMaxPrice',
                adjustmentPercentage: 0,
                adjustmentReason: null,
                updatedBy: req.user._id
            }
        );

        return success(res, `Reset ${result.modifiedCount} artwork pricing records to original prices`);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Apply global adjustment to any pricing data (for artworks without existing pricing records)
export const applyGlobalAdjustmentToPricing = async (req, res) => {
    try {
        const { originalPrice, originalPriceType, originalMinPrice, originalMaxPrice, category, artistName, artworkId } = req.body;

        if (!originalPrice || !originalPriceType) {
            return badRequest(res, "Original price and price type are required");
        }

        // Check if there's a global adjustment that should be applied
        const globalAdjustment = await GlobalPricingAdjustment.findOne({ isActive: true });
        
        if (!globalAdjustment) {
            // No global adjustment, return original pricing
            return success(res, "No global adjustment active", {
                originalPrice,
                originalPriceType,
                originalMinPrice,
                originalMaxPrice,
                adjustedPrice: originalPrice,
                adjustedPriceType: originalPriceType,
                adjustedMinPrice: originalMinPrice,
                adjustedMaxPrice: originalMaxPrice,
                adjustmentPercentage: 0,
                globalAdjustmentApplied: false
            });
        }

        // Check if this artwork should be affected by the global adjustment
        let shouldApplyGlobal = true;
        
        if (globalAdjustment.appliedToCategories.length > 0) {
            shouldApplyGlobal = globalAdjustment.appliedToCategories.includes(category);
        }
        
        if (shouldApplyGlobal && globalAdjustment.appliedToArtists.length > 0) {
            shouldApplyGlobal = globalAdjustment.appliedToArtists.includes(artistName);
        }
        
        if (shouldApplyGlobal && globalAdjustment.excludeArtworks.length > 0) {
            shouldApplyGlobal = !globalAdjustment.excludeArtworks.includes(artworkId);
        }

        if (shouldApplyGlobal) {
            // Check if there's an existing pricing record for this artwork
            let existingPricing = null;
            if (artworkId) {
                existingPricing = await ArtworkPricing.findOne({ artworkId, isActive: true });
            }

            // Apply global adjustment on-the-fly
            let adjustedPrice, adjustedMinPrice, adjustedMaxPrice;

            if (originalPriceType === 'Money') {
                // If there's existing pricing with adjustments, compound the new adjustment
                if (existingPricing && existingPricing.adjustmentPercentage !== 0) {
                    adjustedPrice = existingPricing.adjustedPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                } else {
                    adjustedPrice = originalPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                }
            } else if (originalPriceType === 'PriceRange') {
                if (existingPricing && existingPricing.adjustmentPercentage !== 0) {
                    adjustedMinPrice = existingPricing.adjustedMinPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                    adjustedMaxPrice = existingPricing.adjustedMaxPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                } else {
                    adjustedMinPrice = originalMinPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                    adjustedMaxPrice = originalMaxPrice * (1 + globalAdjustment.adjustmentPercentage / 100);
                }
                adjustedPrice = (adjustedMinPrice + adjustedMaxPrice) / 2;
            }

            // Calculate cumulative adjustment percentage for display
            const cumulativeAdjustmentPercentage = existingPricing && existingPricing.adjustmentPercentage !== 0
                ? calculateCumulativeAdjustment(originalPrice, adjustedPrice)
                : globalAdjustment.adjustmentPercentage;

            const adjustedPricing = {
                originalPrice,
                originalPriceType,
                originalMinPrice,
                originalMaxPrice,
                adjustedPrice,
                adjustedPriceType: originalPriceType,
                adjustedMinPrice,
                adjustedMaxPrice,
                adjustmentPercentage: cumulativeAdjustmentPercentage,
                adjustmentReason: globalAdjustment.adjustmentReason,
                globalAdjustmentApplied: true
            };

            return success(res, "Global adjustment applied successfully", adjustedPricing);
        } else {
            // Global adjustment doesn't apply to this artwork
            return success(res, "Global adjustment not applicable to this artwork", {
                originalPrice,
                originalPriceType,
                originalMinPrice,
                originalMaxPrice,
                adjustedPrice: originalPrice,
                adjustedPriceType: originalPriceType,
                adjustedMinPrice: originalMinPrice,
                adjustedMaxPrice: originalMaxPrice,
                adjustmentPercentage: 0,
                globalAdjustmentApplied: false
            });
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}; 