import express from 'express';
import { submitOffer, getAllOffers, acceptOffer, rejectOffer } from '../../controllers/OfferController/offer.controller.js';
import { IsAuthenticated } from '../../middlewares/authicationmiddleware.js';
// import authentication and admin middleware as needed
const router = express.Router();

// User submits an offer (requires authentication)
router.post('/', IsAuthenticated, submitOffer);

// Admin gets all offers (requires admin)
router.get('/', /*adminMiddleware,*/ getAllOffers);

// Admin accepts an offer
router.patch('/:id/accept', /*adminMiddleware,*/ acceptOffer);

// Admin rejects an offer
router.patch('/:id/reject', /*adminMiddleware,*/ rejectOffer);

export default router; 