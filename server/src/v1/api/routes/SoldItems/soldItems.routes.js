import express from 'express';
import {
  getAllSoldArtworks,
  markArtworkAsSold,
  markArtworkAsAvailable,
  markArtworkAsReserved,
  getSoldArtworksStats,
  bulkMarkAsSold
} from '../../controllers/SoldItemsController/soldItems.controller.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();

// Get all sold artworks (Admin only)
router.get('/sold', IsAuthenticated, authorizeRoles('ADMIN'), getAllSoldArtworks);

// Get sold artworks statistics (Admin only)
router.get('/stats', IsAuthenticated, authorizeRoles('ADMIN'), getSoldArtworksStats);

// Mark artwork as sold (Admin only)
router.patch('/:galleryId/:artworkId/sold', IsAuthenticated, authorizeRoles('ADMIN'), markArtworkAsSold);

// Mark artwork as available/unsold (Admin only)
router.patch('/:galleryId/:artworkId/available', IsAuthenticated, authorizeRoles('ADMIN'), markArtworkAsAvailable);

// Mark artwork as reserved (Admin only)
router.patch('/:galleryId/:artworkId/reserved', IsAuthenticated, authorizeRoles('ADMIN'), markArtworkAsReserved);

// Bulk mark artworks as sold (Admin only)
router.patch('/bulk-sold', IsAuthenticated, authorizeRoles('ADMIN'), bulkMarkAsSold);

export default router;
