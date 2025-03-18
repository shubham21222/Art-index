import Inquiry from '../../models/Inquiry.js';
import { sendEmail } from '../Utils/sendEmail.js';
import {
  success,
  badRequest,
  serverValidation,
  notFound
} from '../formatters/globalResponse.js';

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, artwork } = req.body;

    if (!name || !email || !message || !artwork) {
      return badRequest(res, 'Missing required fields');
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      artwork
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for your inquiry',
      html: `
        <h1>Thank you for your inquiry</h1>
        <p>Dear ${name},</p>
        <p>We have received your inquiry about "${artwork.title}". Our team will review your request and get back to you shortly with pricing information.</p>
        <p>Best regards,</p>
        <p>Art Index Team</p>
      `
    });

    return success(res, 'Inquiry created successfully', inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return serverValidation(res, error.message);
  }
};

// Get all inquiries (admin only)
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return success(res, 'Inquiries fetched successfully', inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return serverValidation(res, error.message);
  }
};

// Send response to inquiry
export const respondToInquiry = async (req, res) => {
  try {
    const { inquiryId, response } = req.body;

    if (!inquiryId || !response) {
      return badRequest(res, 'Missing required fields');
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return notFound(res, 'Inquiry not found');
    }

    // Update inquiry status and response
    inquiry.status = 'responded';
    inquiry.response = response;
    inquiry.respondedAt = new Date();
    await inquiry.save();

    // Send email to user with the response
    await sendEmail({
      to: inquiry.email,
      subject: `Price Information for ${inquiry.artwork.title}`,
      html: `
        <h1>Price Information</h1>
        <p>Dear ${inquiry.name},</p>
        <p>Thank you for your interest in "${inquiry.artwork.title}".</p>
        <p>${response}</p>
        <p>Best regards,</p>
        <p>Art Index Team</p>
      `
    });

    return success(res, 'Response sent successfully', inquiry);
  } catch (error) {
    console.error('Error sending response:', error);
    return serverValidation(res, error.message);
  }
}; 