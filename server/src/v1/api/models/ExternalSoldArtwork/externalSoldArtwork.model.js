import mongoose from 'mongoose';

const externalSoldArtworkSchema = new mongoose.Schema({
  // Artsy API identifiers
  artsyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    index: true
  },
  
  // Basic artwork information
  title: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  href: {
    type: String,
    default: ''
  },
  
  // Sold status information
  soldStatus: {
    type: String,
    enum: ['sold', 'reserved', 'available'],
    default: 'available'
  },
  soldPrice: {
    type: Number,
    default: null
  },
  soldTo: {
    type: String,
    default: ''
  },
  soldNotes: {
    type: String,
    default: ''
  },
  soldAt: {
    type: Date,
    default: null
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Additional metadata
  category: {
    type: String,
    default: 'External Artwork'
  },
  displayType: {
    type: String,
    default: 'Artwork'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
externalSoldArtworkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
externalSoldArtworkSchema.index({ artsyId: 1, slug: 1 });
externalSoldArtworkSchema.index({ soldStatus: 1 });
externalSoldArtworkSchema.index({ soldAt: -1 });

const ExternalSoldArtwork = mongoose.model('ExternalSoldArtwork', externalSoldArtworkSchema);

export default ExternalSoldArtwork;
