import mongoose from "mongoose";
import { Schema } from "mongoose";

const QuoteSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please add your first name"],
    },
    lastName: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
    },
    phone: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        required: [true, "Please select a location"],
    },
    reasonForPartnering: {
        type: String,
        required: [true, "Please specify why you want to partner"],
    }
}, {
    timestamps: true
});

export default mongoose.model("Quote", QuoteSchema);
