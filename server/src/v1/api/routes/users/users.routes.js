import express from "express";
import { getAllSponsors, getAllUsersAdmin, getUserStats, deleteUser } from "../../controllers/AuthController/auth.controller.js";
import { IsAuthenticated, authorizeRoles } from "../../middlewares/authicationmiddleware.js";

const router = express.Router();

// Get all sponsors (admin only)
router.get("/sponsors", IsAuthenticated, authorizeRoles("ADMIN"), getAllSponsors);

// Get all users with filtering and pagination (admin only)
router.get("/all", IsAuthenticated, authorizeRoles("ADMIN"), getAllUsersAdmin);

// Get user statistics (admin only)
router.get("/stats", IsAuthenticated, authorizeRoles("ADMIN"), getUserStats);

// Delete user (admin only)
router.delete("/:id", IsAuthenticated, authorizeRoles("ADMIN"), deleteUser);

export default router; 