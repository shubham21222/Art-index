import mongoose, { Schema } from "mongoose";

const ArtworkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  description: {
    type: String,
    default: "",
  },
  artist: {
    type: String,
    default: "",
  },
  year: {
    type: String,
    default: "",
  },
  medium: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    required: true,
  },

  endDate:{
    type:Date,
    required:false
  },
  
  description: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const MuseumSchema = new mongoose.Schema(
  {
    internalID: {
      type: String,
      unique: true,
      sparse: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    contact: {
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },

    ArtType:[{
      type:String
    }],
    events: [EventSchema],
    artworks: [ArtworkSchema],
    isActive: {
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

export default mongoose.model("Museum", MuseumSchema); 