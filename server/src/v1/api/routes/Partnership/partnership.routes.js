import express from "express";
import {
    submitPartnership,
    getAllPartnerships,
    getPartnershipById,
    approvePartnership,
    rejectPartnership,
    getPartnershipStats
} from "../../controllers/PartnershipController/partnership.controller.js";
import { IsAuthenticated, authorizeRoles } from "../../middlewares/authicationmiddleware.js";

const router = express.Router();

// Public route - Submit partnership request
router.post("/submit", submitPartnership);

// Admin routes - Require authentication and admin role
router.get("/all", IsAuthenticated, authorizeRoles('ADMIN'), getAllPartnerships);
router.get("/stats", IsAuthenticated, authorizeRoles('ADMIN'), getPartnershipStats);
router.get("/:id", IsAuthenticated, authorizeRoles('ADMIN'), getPartnershipById);
router.put("/:id/approve", IsAuthenticated, authorizeRoles('ADMIN'), approvePartnership);
router.put("/:id/reject", IsAuthenticated, authorizeRoles('ADMIN'), rejectPartnership);

export default router; 