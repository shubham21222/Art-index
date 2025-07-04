import mongoose from "mongoose";

const sponsorBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    sponsorName: {
      type: String,
      required: true,
      trim: true,
    },
    sponsorWebsite: {
      type: String,
      required: true,
      trim: true,
    },
    placement: {
      type: String,
      enum: ['homepage', 'collect', 'museums', 'artists', 'galleries', 'price-index'],
      required: true,
    },
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'middle',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    clickThroughRate: {
      type: Number,
      default: 0,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate click-through rate before saving
sponsorBannerSchema.pre('save', function(next) {
  if (this.impressions > 0) {
    this.clickThroughRate = (this.clicks / this.impressions) * 100;
  }
  next();
});

// Index for efficient queries
sponsorBannerSchema.index({ placement: 1, isActive: 1, status: 1 });
sponsorBannerSchema.index({ startDate: 1, endDate: 1 });

const SponsorBanner = mongoose.model("SponsorBanner", sponsorBannerSchema);

export default SponsorBanner; 