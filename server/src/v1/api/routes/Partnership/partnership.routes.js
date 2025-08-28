import express from "express";
import { getAllPartnerships, approvePartnership, rejectPartnership, getPartnershipStats, submitPartnership } from "../../controllers/PartnershipController/partnership.controller.js";
import { IsAuthenticated, authorizeRoles } from "../../middlewares/authicationmiddleware.js";
import { testEmailService } from "../../Utils/sendEmail.js";

const router = express.Router();

// Public routes
router.post("/submit", submitPartnership);

// Test email endpoint
router.post("/test-email", async (req, res) => {
    try {
        const { email, partnershipType } = req.body;
        
        if (!email || !partnershipType) {
            return res.status(400).json({ error: 'Email and partnership type are required' });
        }
        
        console.log('Testing email service for partnership type:', partnershipType);
        
        const testEmailContent = `
            <h1>Test Email for Partnership Type: ${partnershipType}</h1>
            <p>This is a test email to verify the email service is working for all partnership types.</p>
            <p>Partnership Type: ${partnershipType}</p>
            <p>Test Time: ${new Date().toISOString()}</p>
        `;
        
        const { sendEmail } = await import('../../Utils/sendEmail.js');
        
        await sendEmail({
            to: email,
            subject: `Test Email - ${partnershipType}`,
            html: testEmailContent
        });
        
        res.json({ success: true, message: `Test email sent successfully for ${partnershipType}` });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin routes
router.get("/all", IsAuthenticated, authorizeRoles('ADMIN'), getAllPartnerships);
router.get("/stats", IsAuthenticated, authorizeRoles('ADMIN'), getPartnershipStats);
router.put("/:id/approve", IsAuthenticated, authorizeRoles('ADMIN'), approvePartnership);
router.put("/:id/reject", IsAuthenticated, authorizeRoles('ADMIN'), rejectPartnership);

// Test email endpoint (for debugging)
router.get("/test-email", IsAuthenticated, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const result = await testEmailService();
        res.json({ success: true, message: 'Email service test completed', result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Email service test failed', error: error.message });
    }
});

export default router; 