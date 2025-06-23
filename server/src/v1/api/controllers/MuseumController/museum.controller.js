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

        museum.events.push(req.body);
        await museum.save();

        return created(res, "Event added successfully", museum);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update event in museum
export const updateEvent = async (req, res) => {
    try {
        const { museumId, eventId } = req.params;
        
        const museum = await MuseumModel.findById(museumId);
        if (!museum) return notFound(res, "Museum not found");

        const eventIndex = museum.events.findIndex(event => event._id.toString() === eventId);
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

        museum.artworks.push(req.body);
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