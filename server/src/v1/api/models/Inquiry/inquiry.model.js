import mongoose from "mongoose";
import { Schema } from "mongoose";

const InquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
    },
    itemName: {
        type: String,
        required: [true, "Please input product name"],
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
    },
    phone: {
        type: String,
        default: null,
    },
    message: {
        type: String,
        required: [true, "Please add a message"],
    },
    status: {
        type: String,
        enum: ['pending', 'responded'],
        default: 'pending',
    },
    response: {
        type: String,
    },
    respondedAt: {
        type: Date,
    },
}, {
    timestamps: true
});

export default mongoose.model("Inquiry", InquirySchema);
