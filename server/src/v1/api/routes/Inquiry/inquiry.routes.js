import express from "express";
import {
    createInquiry,
    getAllInquiries,
    getSingleInquiry,
    updateInquiry,
    deleteInquiry
} from "../../controllers/InquiryController/inquiry.controller.js";
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"
import { testEmailService } from "../../Utils/sendEmail.js";

const router = express.Router();

router.post("/", createInquiry);
router.get("/",IsAuthenticated , authorizeRoles('ADMIN'), getAllInquiries);
router.get("/:id", IsAuthenticated , authorizeRoles('ADMIN'),getSingleInquiry);
router.put("/:id", IsAuthenticated , authorizeRoles('ADMIN'), updateInquiry);
router.delete("/:id", IsAuthenticated , authorizeRoles('ADMIN'), deleteInquiry);

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
