import express from 'express';
import {
  updateExternalArtworkStatus,
  getExternalArtworkStatus,
  getAllExternalSoldArtworks,
  deleteExternalArtwork,
  getExternalArtworkStats
} from '../../controllers/ExternalSoldArtworkController/externalSoldArtwork.controller.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();

// Update external artwork sold status (Admin only)
router.put('/update', IsAuthenticated, authorizeRoles('ADMIN'), updateExternalArtworkStatus);

// Get external artwork sold status (Public - for checking on artwork pages)
router.get('/status', getExternalArtworkStatus);

// Get all external sold artworks (Admin only)
router.get('/external-sold', IsAuthenticated, authorizeRoles('ADMIN'), getAllExternalSoldArtworks);

// Get external artwork statistics (Admin only)
router.get('/stats', IsAuthenticated, authorizeRoles('ADMIN'), getExternalArtworkStats);

// Delete external artwork record (Admin only)
router.delete('/:id', IsAuthenticated, authorizeRoles('ADMIN'), deleteExternalArtwork);

export default router;
