import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        enum: ['us', 'uk', 'ca']
    },
    partnershipType: {
        type: String,
        required: [true, 'Partnership type is required'],
        enum: ['auctions', 'fairs', 'museums', 'galleries', 'sponsors']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    termsAccepted: {
        type: Boolean,
        required: [true, 'Terms acceptance is required'],
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    approvalEmailSent: {
        type: Boolean,
        default: false
    },
    rejectionEmailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
partnershipSchema.index({ email: 1, status: 1 });
partnershipSchema.index({ partnershipType: 1, status: 1 });

const Partnership = mongoose.model('Partnership', partnershipSchema);

export default Partnership; 