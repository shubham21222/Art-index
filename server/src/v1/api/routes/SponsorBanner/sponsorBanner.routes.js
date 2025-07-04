import express from "express";
import {
  createSponsorBanner,
  getAllSponsorBanners,
  getActiveSponsorBanners,
  getSponsorBannerById,
  updateSponsorBanner,
  deleteSponsorBanner,
  trackImpression,
  trackClick,
  getSponsorBannerStats,
  toggleBannerStatus,
} from "../../controllers/SponsorBannerController/sponsorBanner.controller.js";
import { IsAuthenticated, authorizeRoles } from "../../middlewares/authicationmiddleware.js";

const router = express.Router();

// Public routes (for tracking)
router.get("/active/:placement", getActiveSponsorBanners);
router.post("/track/impression/:id", trackImpression);
router.post("/track/click/:id", trackClick);

// Admin routes
router.post("/create", IsAuthenticated, authorizeRoles("ADMIN"), createSponsorBanner);
router.get("/all", IsAuthenticated, authorizeRoles("ADMIN"), getAllSponsorBanners);
router.get("/stats", IsAuthenticated, authorizeRoles("ADMIN"), getSponsorBannerStats);
router.get("/:id", IsAuthenticated, authorizeRoles("ADMIN"), getSponsorBannerById);
router.put("/:id", IsAuthenticated, authorizeRoles("ADMIN"), updateSponsorBanner);
router.delete("/:id", IsAuthenticated, authorizeRoles("ADMIN"), deleteSponsorBanner);
router.patch("/:id/toggle", IsAuthenticated, authorizeRoles("ADMIN"), toggleBannerStatus);

export default router; 