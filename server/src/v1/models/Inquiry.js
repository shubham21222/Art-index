import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  artwork: {
    title: String,
    artistNames: String,
    price: String,
    id: String,
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
  timestamps: true,
});

export default mongoose.model('Inquiry', inquirySchema); 