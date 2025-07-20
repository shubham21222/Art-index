import express from 'express';
import {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getAllNewsletterSubscriptions,
    getNewsletterStats,
    sendNewsletterToAll,
    deleteNewsletterSubscription
} from '../../controllers/NewsletterController/index.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin routes
router.get('/admin/subscriptions', IsAuthenticated, authorizeRoles('ADMIN'), getAllNewsletterSubscriptions);
router.get('/admin/stats', IsAuthenticated, authorizeRoles('ADMIN'), getNewsletterStats);
router.post('/admin/send', IsAuthenticated, authorizeRoles('ADMIN'), sendNewsletterToAll);
router.delete('/admin/subscription/:id', IsAuthenticated, authorizeRoles('ADMIN'), deleteNewsletterSubscription);

export default router; 