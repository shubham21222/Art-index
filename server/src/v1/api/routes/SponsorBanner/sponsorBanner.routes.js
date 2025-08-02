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

// Admin and Sponsor routes
router.post("/create", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), createSponsorBanner);
router.get("/all", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), getAllSponsorBanners);
router.get("/stats", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), getSponsorBannerStats);
router.get("/:id", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), getSponsorBannerById);
router.put("/:id", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), updateSponsorBanner);
router.delete("/:id", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), deleteSponsorBanner);
router.patch("/:id/toggle", IsAuthenticated, authorizeRoles("ADMIN", "SPONSOR"), toggleBannerStatus);

export default router; 