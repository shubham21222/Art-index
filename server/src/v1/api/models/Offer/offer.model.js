import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false
  },
  externalProductTitle: {
    type: String
  },
  externalProductId: {
    type: String
  },
  externalProductSlug: {
    type: String
  },
  offerAmount: {
    type: Number,
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  adminNote: {
    type: String
  },
  decisionAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model("Offer", offerSchema); 