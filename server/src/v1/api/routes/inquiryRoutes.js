import express from 'express';
import { createInquiry, getInquiries, respondToInquiry } from '../controllers/inquiryController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating inquiries
router.post('/inquiries', createInquiry);

// Admin routes (protected)
router.get('/admin/inquiries', isAuthenticated, isAdmin, getInquiries);
router.post('/admin/respond', isAuthenticated, isAdmin, respondToInquiry);

export default router; 