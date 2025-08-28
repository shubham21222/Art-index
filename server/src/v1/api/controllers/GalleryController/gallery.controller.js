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
} from "../../../../../src/v1/api/formatters/globalResponse.js";

import GalleryModel from "../../models/Gallery/gallery.model.js";
import mongoose from "mongoose";


// Create a new gallery
export const createBulkGalleries = async (req, res) => {
    try {
        const galleries = Array.isArray(req.body) ? req.body : [req.body];

        // Validation: Check all have a title
        const invalidEntries = galleries.filter(g => !g.title);
        if (invalidEntries.length > 0) {
            return badRequest(res, "All galleries must have a title.");
        }

        // Prepare payload with default values and createdBy
        const payload = galleries.map(gallery => {
            // Handle category field - if it's a valid ObjectId, use it as category, otherwise use as categoryName
            let category = null;
            let categoryName = null;
            
            if (gallery.category) {
                if (typeof gallery.category === 'string') {
                    // Check if it's a valid ObjectId
                    if (mongoose.Types.ObjectId.isValid(gallery.category)) {
                        category = gallery.category;
                    } else {
                        categoryName = gallery.category;
                    }
                } else {
                    category = gallery.category;
                }
            }
            
            return {
                title: gallery.title,
                description: gallery.description || "",
                images: gallery.images || [],
                category: category,
                categoryName: categoryName,
                artist: gallery.artist || null,
                isFeatured: gallery.isFeatured || false,
                active: gallery.active !== undefined ? gallery.active : true,
                createdBy: req.user?._id || null,
            };
        });

        const createdGalleries = await GalleryModel.insertMany(payload);

        // return sendResponse(
        //   res,
        //   `${createdGalleries.length} galleries created successfully.`,
        //   createdGalleries
        // );

        return success(
            res,
            `${createdGalleries.length} galleries created successfully.`,
            createdGalleries

        )
    } catch (error) {
        console.log(error)
        return unknownError(res, error.message);
    }
};

// Admin create gallery function
export const adminCreateGallery = async (req, res) => {
    try {
        const { title, description, images, category, categoryName, artist, isFeatured, active, createdBy } = req.body;

        // Validation: Check required fields
        if (!title) {
            return badRequest(res, "Gallery title is required.");
        }

        // Handle category field - if it's a valid ObjectId, use it as category, otherwise use as categoryName
        let finalCategory = null;
        let finalCategoryName = null;
        
        if (category) {
            if (typeof category === 'string') {
                // Check if it's a valid ObjectId
                if (mongoose.Types.ObjectId.isValid(category)) {
                    finalCategory = category;
                } else {
                    finalCategoryName = category;
                }
            } else {
                finalCategory = category;
            }
        } else if (categoryName) {
            finalCategoryName = categoryName;
        }

        // Create gallery payload
        const galleryData = {
            title,
            description: description || "",
            images: images || [],
            category: finalCategory,
            categoryName: finalCategoryName,
            artist: artist || null,
            isFeatured: isFeatured || false,
            active: active !== undefined ? active : true,
            createdBy: createdBy || req.user?._id, // Use provided createdBy or admin's ID
        };

        const newGallery = await GalleryModel.create(galleryData);

        // Populate the created gallery with user details
        const populatedGallery = await GalleryModel.findById(newGallery._id)
            .populate("createdBy", "name email role")
            .populate("artist", "name email role")
            .lean();

        // Format the response
        const formattedGallery = {
            ...populatedGallery,
            categoryDisplay: populatedGallery.category?.name || populatedGallery.categoryName || "Uncategorized",
            createdByUser: populatedGallery.createdBy ? {
                _id: populatedGallery.createdBy._id,
                name: populatedGallery.createdBy.name,
                email: populatedGallery.createdBy.email,
                role: populatedGallery.createdBy.role
            } : null,
            artistUser: populatedGallery.artist ? {
                _id: populatedGallery.artist._id,
                name: populatedGallery.artist.name,
                email: populatedGallery.artist.email,
                role: populatedGallery.artist.role
            } : null,
            totalArtworks: populatedGallery.artworks ? populatedGallery.artworks.length : 0,
            activeArtworks: populatedGallery.artworks ? populatedGallery.artworks.filter(art => art.isActive).length : 0
        };

        return success(res, "Gallery created successfully by admin", formattedGallery);
    } catch (error) {
        console.log("Error creating gallery as admin:", error);
        return unknownError(res, error.message);
    }
};

// Admin update gallery artworks function
export const adminUpdateGalleryArtworks = async (req, res) => {
    try {
        const { id } = req.params;
        const { artworks } = req.body;

        if (!Array.isArray(artworks)) {
            return badRequest(res, "Artworks must be an array");
        }

        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            return notFound(res, "Gallery not found");
        }

        // Update the artworks array
        gallery.artworks = artworks;
        await gallery.save();

        // Populate the updated gallery with user details
        const populatedGallery = await GalleryModel.findById(gallery._id)
            .populate("createdBy", "name email role")
            .populate("artist", "name email role")
            .lean();

        // Format the response
        const formattedGallery = {
            ...populatedGallery,
            categoryDisplay: populatedGallery.category?.name || populatedGallery.categoryName || "Uncategorized",
            createdByUser: populatedGallery.createdBy ? {
                _id: populatedGallery.createdBy._id,
                name: populatedGallery.createdBy.name,
                email: populatedGallery.createdBy.email,
                role: populatedGallery.createdBy.role
            } : null,
            artistUser: populatedGallery.artist ? {
                _id: populatedGallery.artist._id,
                name: populatedGallery.artist.name,
                email: populatedGallery.artist.email,
                role: populatedGallery.artist.role
            } : null,
            totalArtworks: populatedGallery.artworks ? populatedGallery.artworks.length : 0,
            activeArtworks: populatedGallery.artworks ? populatedGallery.artworks.filter(art => art.isActive).length : 0
        };

        return success(res, "Gallery artworks updated successfully", formattedGallery);
    } catch (error) {
        console.log("Error updating gallery artworks as admin:", error);
        return unknownError(res, error.message);
    }
};

// Admin update gallery function
export const adminUpdateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, category, categoryName, artist, isFeatured, active, createdBy } = req.body;

        if (!title) {
            return badRequest(res, "Gallery title is required.");
        }

        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            return notFound(res, "Gallery not found");
        }

        // Update gallery fields
        gallery.title = title;
        gallery.description = description || "";
        gallery.images = images || [];
        gallery.category = category || null;
        gallery.categoryName = categoryName || null;
        gallery.artist = artist || null;
        gallery.isFeatured = isFeatured || false;
        gallery.active = active !== undefined ? active : true;
        gallery.createdBy = createdBy || req.user?._id;

        await gallery.save();

        // Populate the updated gallery with user details
        const populatedGallery = await GalleryModel.findById(gallery._id)
            .populate("createdBy", "name email role")
            .populate("artist", "name email role")
            .lean();

        // Format the response
        const formattedGallery = {
            ...populatedGallery,
            categoryDisplay: populatedGallery.category?.name || populatedGallery.categoryName || "Uncategorized",
            createdByUser: populatedGallery.createdBy ? {
                _id: populatedGallery.createdBy._id,
                name: populatedGallery.createdBy.name,
                email: populatedGallery.createdBy.email,
                role: populatedGallery.createdBy.role
            } : null,
            artistUser: populatedGallery.artist ? {
                _id: populatedGallery.artist._id,
                name: populatedGallery.artist.name,
                email: populatedGallery.artist.email,
                role: populatedGallery.artist.role
            } : null,
            totalArtworks: populatedGallery.artworks ? populatedGallery.artworks.length : 0,
            activeArtworks: populatedGallery.artworks ? populatedGallery.artworks.filter(art => art.isActive).length : 0
        };

        return success(res, "Gallery updated successfully", formattedGallery);
    } catch (error) {
        console.log("Error updating gallery as admin:", error);
        return unknownError(res, error.message);
    }
};




// get All Galleries

export const getAllGalleries = async (req, res) => {
    try {
        const filter = {};

        if (req.query.category) filter.category = req.query.category;
        if (req.query.artist) filter.artist = req.query.artist;
        if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
        if (req.query.active) filter.active = req.query.active === "true";

        const galleries = await GalleryModel.find(filter)
            .populate("category", "name")
            .populate("artist", "name email")
            .lean(); // Convert to plain objects for easier manipulation

        // Add category display name to each gallery
        const galleriesWithCategoryName = galleries.map(gallery => ({
            ...gallery,
            categoryDisplay: gallery.category?.name || gallery.categoryName || 'Uncategorized'
        }));

        return success(res , "Galleries fetched successfully" , galleriesWithCategoryName)
    } catch (error) {
        return unknownError(res, error.message);
    }
};



// get Gallery by ID

export const getGalleryById = async (req, res) => {
    try {
        const gallery = await GalleryModel.findById(req.params.id)
            .populate("category", "name")
            .populate("artist", "name email");

        if (!gallery) return badRequest(res, "Gallery not found");

        return success(res, "Gallery fetched successfully", gallery);
    } catch (error) {
        return unknownError(res, error.message);
    }
};



// Update Gallery by ID
export const updateGallery = async (req, res) => {
    try {
        console.log('Update gallery request body:', req.body);
        console.log('Update gallery ID:', req.params.id);
        
        // Handle category field - if it's a valid ObjectId, use it as category, otherwise use as categoryName
        let updateData = { ...req.body };
        
        if (req.body.category) {
            console.log('Processing category:', req.body.category);
            if (typeof req.body.category === 'string') {
                // Check if it's a valid ObjectId
                if (mongoose.Types.ObjectId.isValid(req.body.category)) {
                    updateData.category = req.body.category;
                    updateData.categoryName = null; // Clear categoryName if using ObjectId
                    console.log('Category is valid ObjectId, using as category');
                } else {
                    updateData.categoryName = req.body.category;
                    updateData.category = null; // Clear category if using string
                    console.log('Category is string, using as categoryName');
                }
            } else {
                updateData.category = req.body.category;
                updateData.categoryName = null;
                console.log('Category is not string, using as category');
            }
        }

        console.log('Final update data:', updateData);

        const gallery = await GalleryModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!gallery) {
            console.log('Gallery not found with ID:', req.params.id);
            return badRequest(res, "Gallery not found");
        }

        console.log('Gallery updated successfully:', gallery);
        return sendResponse(res, "Gallery updated successfully", gallery);
    } catch (error) {
        console.log("Gallery update error:", error);
        console.log("Error stack:", error.stack);
        return unknownError(res, error.message);
    }
};


// delete Gallery by ID
export const deleteGallery = async (req, res) => {
    try {
        const gallery = await GalleryModel.findByIdAndDelete(req.params.id);

        if (!gallery) return badRequest(res, "Gallery not found");

        return sendResponse(res, "Gallery deleted successfully", gallery);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Add artwork to gallery
export const addArtwork = async (req, res) => {
    try {
        const gallery = await GalleryModel.findById(req.params.id);
        if (!gallery) return notFound(res, "Gallery not found");

        // Format artwork images URLs if provided
        let artworkImages = req.body.images;
        if (artworkImages && Array.isArray(artworkImages)) {
            artworkImages = artworkImages.map(img => {
                if (img && typeof img === 'string') {
                    if (img.startsWith('www.')) {
                        return `https://${img}`;
                    } else if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/')) {
                        return null; // Set to null if invalid URL
                    }
                }
                return img;
            }).filter(img => img !== null); // Remove null values
        }

        const artworkData = {
            ...req.body,
            images: artworkImages,
        };

        gallery.artworks.push(artworkData);
        await gallery.save();

        return created(res, "Artwork added successfully", gallery);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update artwork in gallery
export const updateArtwork = async (req, res) => {
    try {
        const { galleryId, artworkId } = req.params;
        
        const gallery = await GalleryModel.findById(galleryId);
        if (!gallery) return notFound(res, "Gallery not found");

        const artworkIndex = gallery.artworks.findIndex(artwork => artwork._id.toString() === artworkId);
        if (artworkIndex === -1) return notFound(res, "Artwork not found");

        // Format artwork images URLs if provided
        let artworkImages = req.body.images;
        if (artworkImages && Array.isArray(artworkImages)) {
            artworkImages = artworkImages.map(img => {
                if (img && typeof img === 'string') {
                    if (img.startsWith('www.')) {
                        return `https://${img}`;
                    } else if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/')) {
                        return null; // Set to null if invalid URL
                    }
                }
                return img;
            }).filter(img => img !== null); // Remove null values
        }

        const updateData = {
            ...req.body,
            images: artworkImages,
        };

        gallery.artworks[artworkIndex] = { ...gallery.artworks[artworkIndex].toObject(), ...updateData };
        await gallery.save();

        return success(res, "Artwork updated successfully", gallery);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete artwork from gallery
export const deleteArtwork = async (req, res) => {
    try {
        const { galleryId, artworkId } = req.params;
        
        const gallery = await GalleryModel.findById(galleryId);
        if (!gallery) return notFound(res, "Gallery not found");

        gallery.artworks = gallery.artworks.filter(artwork => artwork._id.toString() !== artworkId);
        await gallery.save();

        return success(res, "Artwork deleted successfully", gallery);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get gallery statistics
export const getGalleryStats = async (req, res) => {
    try {
        const galleryId = req.params.id;
        const gallery = await GalleryModel.findById(galleryId);
        
        if (!gallery) return notFound(res, "Gallery not found");

        const stats = {
            totalArtworks: gallery.artworks.length,
            activeArtworks: gallery.artworks.filter(artwork => artwork.isActive).length,
            totalImages: gallery.images.length,
            categories: new Set(gallery.artworks.map(artwork => artwork.category)).size,
        };

        return success(res, "Gallery statistics fetched successfully", stats);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all galleries with user details for admin
export const getAllGalleriesWithUsers = async (req, res) => {
    try {
        const filter = {};

        if (req.query.category) filter.category = req.query.category;
        if (req.query.artist) filter.artist = req.query.artist;
        if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
        if (req.query.active) filter.active = req.query.active === "true";

        const galleries = await GalleryModel.find(filter)
            .populate("category", "name")
            .populate("createdBy", "name email role")
            .populate("artist", "name email role")
            .lean();

        // Format the response to include user details and artwork counts
        const formattedGalleries = galleries.map(gallery => ({
            ...gallery,
            categoryDisplay: gallery.category?.name || gallery.categoryName || "Uncategorized",
            createdByUser: gallery.createdBy ? {
                _id: gallery.createdBy._id,
                name: gallery.createdBy.name,
                email: gallery.createdBy.email,
                role: gallery.createdBy.role
            } : null,
            artistUser: gallery.artist ? {
                _id: gallery.artist._id,
                name: gallery.artist.name,
                email: gallery.artist.email,
                role: gallery.artist.role
            } : null,
            totalArtworks: gallery.artworks ? gallery.artworks.length : 0,
            activeArtworks: gallery.artworks ? gallery.artworks.filter(art => art.isActive).length : 0
        }));

        return success(res, "Galleries fetched successfully", formattedGalleries);
    } catch (error) {
        console.log("Error fetching galleries with users:", error);
        return unknownError(res, error.message);
    }
};

// Delete gallery by admin
export const deleteGalleryByAdmin = async (req, res) => {
    try {
        const gallery = await GalleryModel.findById(req.params.id);
        
        if (!gallery) {
            return notFound(res, "Gallery not found");
        }

        await GalleryModel.findByIdAndDelete(req.params.id);

        return success(res, "Gallery deleted successfully", { deletedGalleryId: req.params.id });
    } catch (error) {
        console.log("Error deleting gallery:", error);
        return unknownError(res, error.message);
    }
};

// Get galleries by specific user
export const getGalleriesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const galleries = await GalleryModel.find({ createdBy: userId })
            .populate("category", "name")
            .populate("createdBy", "name email role")
            .populate("artist", "name email role")
            .lean();

        const formattedGalleries = galleries.map(gallery => ({
            ...gallery,
            categoryDisplay: gallery.category?.name || gallery.categoryName || "Uncategorized",
            createdByUser: gallery.createdBy ? {
                _id: gallery.createdBy._id,
                name: gallery.createdBy.name,
                email: gallery.createdBy.email,
                role: gallery.createdBy.role
            } : null,
            artistUser: gallery.artist ? {
                _id: gallery.artist._id,
                name: gallery.artist.name,
                email: gallery.artist.email,
                role: gallery.artist.role
            } : null,
            totalArtworks: gallery.artworks ? gallery.artworks.length : 0,
            activeArtworks: gallery.artworks ? gallery.artworks.filter(art => art.isActive).length : 0
        }));

        return success(res, "User galleries fetched successfully", formattedGalleries);
    } catch (error) {
        console.log("Error fetching user galleries:", error);
        return unknownError(res, error.message);
    }
};

// Get all users who have created galleries
export const getUsersWithGalleries = async (req, res) => {
    try {
        // Get unique user IDs who have created galleries
        const galleries = await GalleryModel.find({})
            .populate("createdBy", "name email role")
            .lean();

        // Group galleries by user
        const userGalleriesMap = new Map();
        
        galleries.forEach(gallery => {
            if (gallery.createdBy) {
                const userId = gallery.createdBy._id.toString();
                if (!userGalleriesMap.has(userId)) {
                    userGalleriesMap.set(userId, {
                        user: gallery.createdBy,
                        galleries: [],
                        totalGalleries: 0,
                        totalArtworks: 0
                    });
                }
                
                const userData = userGalleriesMap.get(userId);
                userData.galleries.push(gallery);
                userData.totalGalleries += 1;
                userData.totalArtworks += gallery.artworks ? gallery.artworks.length : 0;
            }
        });

        const usersWithGalleries = Array.from(userGalleriesMap.values());

        return success(res, "Users with galleries fetched successfully", usersWithGalleries);
    } catch (error) {
        console.log("Error fetching users with galleries:", error);
        return unknownError(res, error.message);
    }
};


