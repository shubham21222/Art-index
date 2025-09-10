import mongoose, { Schema } from "mongoose";

const ArtworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    name: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      default: "",
    },
    birthYear: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
  },
  category: {
    type: String,
    required: true,
  },
  medium: {
    type: String,
    required: true,
  },
  dimensions: {
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: "in",
    },
    displayText: {
      type: String,
      default: "",
    },
  },
  publisher: {
    type: String,
    default: "N/A",
  },
  attribution: {
    type: String,
    default: "Unique",
  },
  condition: {
    framed: {
      type: Boolean,
      default: false,
    },
    signature: {
      type: String,
      default: "Not signed",
    },
    certificateOfAuthenticity: {
      type: Boolean,
      default: false,
    },
  },
  price: {
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: "USD",
    },
    contactPrice: {
      type: Number,
      default: null,
    },
  },
  description: {
    type: String,
    default: "",
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  technicalSpecs: {
    type: String,
    default: "",
  },
  images: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  // Sold status fields
  soldStatus: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  soldAt: {
    type: Date,
    default: null
  },
  soldPrice: {
    type: Number,
    default: null
  },
  soldTo: {
    type: String,
    default: null
  },
  soldBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  soldNotes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const GallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      
    },
    description: {
      type: String,
      default: "",
    },

     images:[
        {
            type: String
        }
     ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    
    categoryName: {
      type: String,
      default: null,
    },


    artist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    artworks: [ArtworkSchema],

    isFeatured: {
      type: Boolean,
      default: false,
    },


    active: {
      type: Boolean,
      default: true,
    },


    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("newGallery", GallerySchema);
