import express from "express";
import { getDashboardStats, getDashboardUpdates } from "../../controllers/AuthController/dashboard.controller.js";
import { IsAuthenticated, authorizeRoles } from "../../middlewares/authicationmiddleware.js";

const router = express.Router();

// Get comprehensive dashboard statistics
router.get("/stats", IsAuthenticated, authorizeRoles("ADMIN"), getDashboardStats);

// Get real-time dashboard updates
router.get("/updates", IsAuthenticated, authorizeRoles("ADMIN"), getDashboardUpdates);

export default router; 