import mongoose, { Schema } from "mongoose";

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


    artist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


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
