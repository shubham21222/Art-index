import express from "express";
import {
    createMuseum,
    getAllMuseums,
    getMuseumById,
    updateMuseum,
    deleteMuseum,
    addEvent,
    updateEvent,
    deleteEvent,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    getMuseumStats
} from "../../controllers/MuseumController/museum.controller.js";
import { IsAuthenticated } from "../../middlewares/authicationmiddleware.js";

const router = express.Router();

// Public routes
router.get("/all", getAllMuseums);
router.get("/:id", getMuseumById);
router.get("/:id/stats", getMuseumStats);

// Protected routes (require authentication)
router.post("/create", IsAuthenticated, createMuseum);
router.post("/update/:id", IsAuthenticated, updateMuseum);
router.post("/delete/:id", IsAuthenticated, deleteMuseum);

// Event management
router.post("/:id/events/add", IsAuthenticated, addEvent);
router.post("/:museumId/events/:eventId/update", IsAuthenticated, updateEvent);
router.post("/:museumId/events/:eventId/delete", IsAuthenticated, deleteEvent);

// Artwork management
router.post("/:id/artworks/add", IsAuthenticated, addArtwork);
router.post("/:museumId/artworks/:artworkId/update", IsAuthenticated, updateArtwork);
router.post("/:museumId/artworks/:artworkId/delete", IsAuthenticated, deleteArtwork);

export default router; 