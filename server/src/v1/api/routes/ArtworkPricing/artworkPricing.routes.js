import express from 'express';
import { 
    createOrUpdateArtworkPricing,
    getAllArtworkPricing, 
    getArtworkPricing,
    deleteArtworkPricing,
    createGlobalPricingAdjustment,
    getCurrentGlobalAdjustment,
    resetArtworkPricing,
    resetAllArtworkPricing,
    applyGlobalAdjustmentToPricing
} from '../../controllers/ArtworkPricingController/artworkPricing.controller.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();

// Individual artwork pricing routes
router.post('/create-or-update', IsAuthenticated, authorizeRoles('ADMIN'), createOrUpdateArtworkPricing);
router.get('/get', getArtworkPricing);
router.get('/all', IsAuthenticated, authorizeRoles('ADMIN'), getAllArtworkPricing);
router.delete('/delete/:id', IsAuthenticated, authorizeRoles('ADMIN'), deleteArtworkPricing);
router.put('/reset/:id', IsAuthenticated, authorizeRoles('ADMIN'), resetArtworkPricing);

// Global pricing adjustment routes
router.post('/global-adjustment', IsAuthenticated, authorizeRoles('ADMIN'), createGlobalPricingAdjustment);
router.get('/global-adjustment', IsAuthenticated, authorizeRoles('ADMIN'), getCurrentGlobalAdjustment);
router.post('/reset-all', IsAuthenticated, authorizeRoles('ADMIN'), resetAllArtworkPricing);

// Apply global adjustment to pricing data (public route)
router.post('/apply-global-adjustment', applyGlobalAdjustmentToPricing);

export default router; 