import mongoose from "mongoose";

const artworkPricingSchema = new mongoose.Schema({
    artworkId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    artworkSlug: {
        type: String,
        required: true,
        index: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    originalPriceType: {
        type: String,
        enum: ['Money', 'PriceRange'],
        required: true
    },
    originalMinPrice: {
        type: Number,
        default: null
    },
    originalMaxPrice: {
        type: Number,
        default: null
    },
    adjustedPrice: {
        type: Number,
        required: true
    },
    adjustedPriceType: {
        type: String,
        enum: ['Money', 'PriceRange'],
        required: true
    },
    adjustedMinPrice: {
        type: Number,
        default: null
    },
    adjustedMaxPrice: {
        type: Number,
        default: null
    },
    adjustmentPercentage: {
        type: Number,
        required: true,
        default: 0 // 0 means no adjustment, positive for increase, negative for decrease
    },
    adjustmentReason: {
        type: String,
        default: null
    },
    artworkTitle: {
        type: String,
        required: true
    },
    artistName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Global pricing adjustment schema
const globalPricingAdjustmentSchema = new mongoose.Schema({
    adjustmentPercentage: {
        type: Number,
        required: true,
        default: 0
    },
    adjustmentReason: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    appliedToCategories: [{
        type: String,
        default: [] // Empty array means apply to all categories
    }],
    appliedToArtists: [{
        type: String,
        default: [] // Empty array means apply to all artists
    }],
    excludeArtworks: [{
        type: String,
        default: [] // Array of artwork IDs to exclude
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
artworkPricingSchema.index({ artworkId: 1, isActive: 1 });
artworkPricingSchema.index({ artworkSlug: 1, isActive: 1 });

// Index for global adjustments
globalPricingAdjustmentSchema.index({ isActive: 1 });

export const ArtworkPricing = mongoose.model('ArtworkPricing', artworkPricingSchema);
export const GlobalPricingAdjustment = mongoose.model('GlobalPricingAdjustment', globalPricingAdjustmentSchema); 