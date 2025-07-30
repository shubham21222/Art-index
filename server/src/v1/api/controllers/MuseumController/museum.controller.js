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

import MuseumModel from "../../models/Museum/museum.model.js";

// Create a new museum
export const createMuseum = async (req, res) => {
    try {
        const museumData = {
            ...req.body,
            createdBy: req.user?._id || null,
        };

        const museum = await MuseumModel.create(museumData);
        return created(res, "Museum created successfully", museum);
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message);
    }
};

// Get all museums
export const getAllMuseums = async (req, res) => {
    try {
        const filter = {};

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true";
        }

        const museums = await MuseumModel.find(filter)
            .populate("createdBy", "name email");

        return success(res, "Museums fetched successfully", museums);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get museum by ID
export const getMuseumById = async (req, res) => {
    try {
        const museum = await MuseumModel.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!museum) return notFound(res, "Museum not found");

        return success(res, "Museum fetched successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update museum by ID
export const updateMuseum = async (req, res) => {
    try {
        const museum = await MuseumModel.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );

        if (!museum) return notFound(res, "Museum not found");

        return success(res, "Museum updated successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete museum by ID
export const deleteMuseum = async (req, res) => {
    try {
        const museum = await MuseumModel.findByIdAndDelete(req.params.id);

        if (!museum) return notFound(res, "Museum not found");

        return success(res, "Museum deleted successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Add event to museum
export const addEvent = async (req, res) => {
    try {
        const museum = await MuseumModel.findById(req.params.id);
        if (!museum) return notFound(res, "Museum not found");

        // Format event image URL if provided
        let eventImage = req.body.image;
        if (eventImage && typeof eventImage === 'string') {
            if (eventImage.startsWith('www.')) {
                eventImage = `https://${eventImage}`;
            } else if (!eventImage.startsWith('http://') && !eventImage.startsWith('https://') && !eventImage.startsWith('/')) {
                eventImage = null; // Set to null if invalid URL
            }
        }

        const eventData = {
            ...req.body,
            image: eventImage,
        };

        museum.events.push(eventData);
        await museum.save();

        return created(res, "Event added successfully", museum);
    } catch (error) {
        console.log(error)
        return unknownError(res, error.message);
    }
};

// Update event in museum
export const updateEvent = async (req, res) => {
    try {
        const { museumId, eventId } = req.params;
        
        const museum = await MuseumModel.findById(museumId);
        if (!museum) return notFound(res, "Museum not found");

        const eventIndex = museum.events.findIndex(event => event._id.toString() == eventId);
        if (eventIndex === -1) return notFound(res, "Event not found");

        museum.events[eventIndex] = { ...museum.events[eventIndex].toObject(), ...req.body };
        await museum.save();

        return success(res, "Event updated successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete event from museum
export const deleteEvent = async (req, res) => {
    try {
        const { museumId, eventId } = req.params;
        
        const museum = await MuseumModel.findById(museumId);
        if (!museum) return notFound(res, "Museum not found");

        museum.events = museum.events.filter(event => event._id.toString() !== eventId);
        await museum.save();

        return success(res, "Event deleted successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Add artwork to museum
export const addArtwork = async (req, res) => {
    try {
        const museum = await MuseumModel.findById(req.params.id);
        if (!museum) return notFound(res, "Museum not found");

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

        museum.artworks.push(artworkData);
        await museum.save();

        return created(res, "Artwork added successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update artwork in museum
export const updateArtwork = async (req, res) => {
    try {
        const { museumId, artworkId } = req.params;
        
        const museum = await MuseumModel.findById(museumId);
        if (!museum) return notFound(res, "Museum not found");

        const artworkIndex = museum.artworks.findIndex(artwork => artwork._id.toString() === artworkId);
        if (artworkIndex === -1) return notFound(res, "Artwork not found");

        museum.artworks[artworkIndex] = { ...museum.artworks[artworkIndex].toObject(), ...req.body };
        await museum.save();

        return success(res, "Artwork updated successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete artwork from museum
export const deleteArtwork = async (req, res) => {
    try {
        const { museumId, artworkId } = req.params;
        
        const museum = await MuseumModel.findById(museumId);
        if (!museum) return notFound(res, "Museum not found");

        museum.artworks = museum.artworks.filter(artwork => artwork._id.toString() !== artworkId);
        await museum.save();

        return success(res, "Artwork deleted successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get museum statistics
export const getMuseumStats = async (req, res) => {
    try {
        const museumId = req.params.id;
        const museum = await MuseumModel.findById(museumId);
        
        if (!museum) return notFound(res, "Museum not found");

        const stats = {
            totalEvents: museum.events.length,
            activeEvents: museum.events.filter(event => event.isActive).length,
            totalArtworks: museum.artworks.length,
            upcomingEvents: museum.events.filter(event => new Date(event.date) > new Date()).length,
        };

        return success(res, "Museum statistics fetched successfully", stats);
    } catch (error) {
        return unknownError(res, error.message);
    }
}; 

// Get all museums with user details for admin
export const getAllMuseumsWithUsers = async (req, res) => {
    try {
        const filter = {};

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true";
        }

        const museums = await MuseumModel.find(filter)
            .populate("createdBy", "name email role")
            .lean();

        // Format the response to include user details and counts
        const formattedMuseums = museums.map(museum => ({
            ...museum,
            createdByUser: museum.createdBy ? {
                _id: museum.createdBy._id,
                name: museum.createdBy.name,
                email: museum.createdBy.email,
                role: museum.createdBy.role
            } : null,
            totalEvents: museum.events ? museum.events.length : 0,
            activeEvents: museum.events ? museum.events.filter(event => event.isActive).length : 0,
            totalArtworks: museum.artworks ? museum.artworks.length : 0
        }));

        return success(res, "Museums fetched successfully", formattedMuseums);
    } catch (error) {
        console.log("Error fetching museums with users:", error);
        return unknownError(res, error.message);
    }
};

// Delete museum by admin
export const deleteMuseumByAdmin = async (req, res) => {
    try {
        const museum = await MuseumModel.findById(req.params.id);
        
        if (!museum) {
            return notFound(res, "Museum not found");
        }

        await MuseumModel.findByIdAndDelete(req.params.id);

        return success(res, "Museum deleted successfully", { deletedMuseumId: req.params.id });
    } catch (error) {
        console.log("Error deleting museum:", error);
        return unknownError(res, error.message);
    }
};

// Get museums by specific user
export const getMuseumsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const museums = await MuseumModel.find({ createdBy: userId })
            .populate("createdBy", "name email role")
            .lean();

        const formattedMuseums = museums.map(museum => ({
            ...museum,
            createdByUser: museum.createdBy ? {
                _id: museum.createdBy._id,
                name: museum.createdBy.name,
                email: museum.createdBy.email,
                role: museum.createdBy.role
            } : null,
            totalEvents: museum.events ? museum.events.length : 0,
            activeEvents: museum.events ? museum.events.filter(event => event.isActive).length : 0,
            totalArtworks: museum.artworks ? museum.artworks.length : 0
        }));

        return success(res, "User museums fetched successfully", formattedMuseums);
    } catch (error) {
        console.log("Error fetching user museums:", error);
        return unknownError(res, error.message);
    }
};

// Get all users who have created museums
export const getUsersWithMuseums = async (req, res) => {
    try {
        // Get unique user IDs who have created museums
        const museums = await MuseumModel.find({})
            .populate("createdBy", "name email role")
            .lean();

        // Group museums by user
        const userMuseumsMap = new Map();
        
        museums.forEach(museum => {
            if (museum.createdBy) {
                const userId = museum.createdBy._id.toString();
                if (!userMuseumsMap.has(userId)) {
                    userMuseumsMap.set(userId, {
                        user: museum.createdBy,
                        museums: [],
                        totalMuseums: 0,
                        totalEvents: 0,
                        totalArtworks: 0
                    });
                }
                
                const userData = userMuseumsMap.get(userId);
                userData.museums.push(museum);
                userData.totalMuseums += 1;
                userData.totalEvents += museum.events ? museum.events.length : 0;
                userData.totalArtworks += museum.artworks ? museum.artworks.length : 0;
            }
        });

        const usersWithMuseums = Array.from(userMuseumsMap.values());

        return success(res, "Users with museums fetched successfully", usersWithMuseums);
    } catch (error) {
        console.log("Error fetching users with museums:", error);
        return unknownError(res, error.message);
    }
}; 