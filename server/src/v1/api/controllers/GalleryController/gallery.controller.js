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
        const payload = galleries.map(gallery => ({
            title: gallery.title,
            description: gallery.description || "",
            images: gallery.images || [],
            category: gallery.category || null,
            artist: gallery.artist || null,
            isFeatured: gallery.isFeatured || false,
            active: gallery.active !== undefined ? gallery.active : true,
            createdBy: req.user?._id || null,
        }));

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
            .populate("artist", "name email");

        return success(res , "Galleries fetched successfully" , galleries)
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
        const gallery = await GalleryModel.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );

        if (!gallery) return badRequest(res, "Gallery not found");

        return sendResponse(res, "Gallery updated successfully", gallery);
    } catch (error) {
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


