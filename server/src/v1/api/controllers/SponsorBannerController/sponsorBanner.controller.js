import SponsorBanner from "../../models/SponsorBanner/sponsorBanner.model.js";
import { catchAsyncError } from "../../middlewares/catchAsyncError.js";
import ErrorHandler from "../../Utils/errorRes.js";
import mongoose from "mongoose";

// Create a new sponsor banner
export const createSponsorBanner = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    image,
    link,
    sponsorName,
    sponsorWebsite,
    placement,
    position,
    startDate,
    endDate,
    contactEmail,
    contactPhone,
    budget,
  } = req.body;

  const sponsorBanner = await SponsorBanner.create({
    title,
    description,
    image,
    link,
    sponsorName,
    sponsorWebsite,
    placement,
    position,
    startDate,
    endDate,
    contactEmail,
    contactPhone,
    budget,
    status: "active", // Set status to active by default
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Sponsor banner created successfully",
    data: sponsorBanner,
  });
});

// Get all sponsor banners (admin or sponsor)
export const getAllSponsorBanners = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, status, placement } = req.query;

  const query = {};
  if (status) query.status = status;
  if (placement) query.placement = placement;

  // If user is a sponsor, only show their own banners
  if (req.user.role === "SPONSOR") {
    query.createdBy = req.user._id;
  }

  const skip = (page - 1) * limit;

  const sponsorBanners = await SponsorBanner.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SponsorBanner.countDocuments(query);

  res.status(200).json({
    success: true,
    items: sponsorBanners,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  });
});

// Get active sponsor banners for a specific placement
export const getActiveSponsorBanners = catchAsyncError(async (req, res, next) => {
  const { placement } = req.params;
  const { position } = req.query;

  const query = {
    placement,
    status: "active", // Only show banners with status "active"
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  };

  if (position) {
    query.position = position;
  }

  const sponsorBanners = await SponsorBanner.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: sponsorBanners,
  });
});

// Get sponsor banner by ID
export const getSponsorBannerById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id).populate(
    "createdBy",
    "name email"
  );

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  // If user is a sponsor, ensure they can only view their own banners
  if (req.user.role === "SPONSOR" && sponsorBanner.createdBy._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only view your own banners", 403));
  }

  res.status(200).json({
    success: true,
    data: sponsorBanner,
  });
});

// Update sponsor banner
export const updateSponsorBanner = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id);

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  // If user is a sponsor, ensure they can only update their own banners
  if (req.user.role === "SPONSOR" && sponsorBanner.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only update your own banners", 403));
  }

  const updatedBanner = await SponsorBanner.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Sponsor banner updated successfully",
    data: updatedBanner,
  });
});

// Delete sponsor banner
export const deleteSponsorBanner = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id);

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  // If user is a sponsor, ensure they can only delete their own banners
  if (req.user.role === "SPONSOR" && sponsorBanner.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only delete your own banners", 403));
  }

  await SponsorBanner.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Sponsor banner deleted successfully",
  });
});

// Track impression
export const trackImpression = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id);

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  sponsorBanner.impressions += 1;
  await sponsorBanner.save();

  res.status(200).json({
    success: true,
    message: "Impression tracked successfully",
  });
});

// Track click
export const trackClick = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id);

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  sponsorBanner.clicks += 1;
  await sponsorBanner.save();

  res.status(200).json({
    success: true,
    message: "Click tracked successfully",
    data: {
      link: sponsorBanner.link,
    },
  });
});

// Get sponsor banner statistics
export const getSponsorBannerStats = catchAsyncError(async (req, res, next) => {
  // Build match stage based on user role
  const matchStage = {};
  if (req.user.role === "SPONSOR") {
    matchStage.createdBy = new mongoose.Types.ObjectId(req.user._id);
  }

  const stats = await SponsorBanner.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: null,
        totalBanners: { $sum: 1 },
        activeBanners: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $lte: ["$startDate", new Date()] },
                  { $gte: ["$endDate", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalImpressions: { $sum: "$impressions" },
        totalClicks: { $sum: "$clicks" },
        totalBudget: { $sum: "$budget" },
      },
    },
  ]);

  const placementStats = await SponsorBanner.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: "$placement",
        count: { $sum: 1 },
        impressions: { $sum: "$impressions" },
        clicks: { $sum: "$clicks" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: stats[0] || {
        totalBanners: 0,
        activeBanners: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalBudget: 0,
      },
      byPlacement: placementStats,
    },
  });
});

// Toggle banner status
export const toggleBannerStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const sponsorBanner = await SponsorBanner.findById(id);

  if (!sponsorBanner) {
    return next(new ErrorHandler("Sponsor banner not found", 404));
  }

  // If user is a sponsor, ensure they can only toggle their own banners
  if (req.user.role === "SPONSOR" && sponsorBanner.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only toggle your own banners", 403));
  }

  // Toggle both isActive and status
  sponsorBanner.isActive = !sponsorBanner.isActive;
  sponsorBanner.status = sponsorBanner.isActive ? "active" : "paused";
  await sponsorBanner.save();

  res.status(200).json({
    success: true,
    message: `Sponsor banner ${sponsorBanner.isActive ? "activated" : "deactivated"} successfully`,
    data: sponsorBanner,
  });
}); 