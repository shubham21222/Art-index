import InquiryModel from "../../models/Inquiry/inquiry.model.js";
import User from "../../models/Auth/User.js";
import { sendEmail } from "../../Utils/sendEmail.js";
import crypto from "crypto";
import {
    success,
    created,
    notFound,
    badRequest,
    sendResponse,
    unknownError,
    isValidObjectId
} from "../../formatters/globalResponse.js";

// Generate verification and password creation tokens
const generateTokens = () => {
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const passwordCreationToken = crypto.randomBytes(20).toString("hex");
    return { verificationToken, passwordCreationToken };
};

// Create a new inquiry
export const createInquiry = async (req, res) => {
    try {
        const { name, itemName, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !itemName || !email || !message) {
            return badRequest(res, "All required fields must be provided.");
        }

        // Check if user exists with this email
        let user = await User.findOne({ email });
        let isNewUser = false;

        // If user doesn't exist, create a new user account
        if (!user) {
            isNewUser = true;
            const { verificationToken, passwordCreationToken } = generateTokens();
            
            // Create new user with verification and password creation tokens
            user = await User.create({
                name,
                email,
                passwordResetToken: passwordCreationToken,
                passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                activeToken: verificationToken, // Using activeToken field for email verification
            });

            // Send welcome email with verification and password creation links
            const verificationUrl = `https://artindex.ai/verify-email/${verificationToken}`;
            const passwordCreationUrl = `https://artindex.ai/create-password/${passwordCreationToken}`;

            const emailMessage = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        margin: 10px 5px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        text-align: center;
                    }
                    .button.secondary {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #666;
                        border-top: 1px solid #e9ecef;
                    }
                    .artwork-info {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #667eea;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Art Index!</h1>
                        <p>Thank you for your interest in our artwork</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Thank you for your interest in <strong>${itemName}</strong>. We're excited to have you as part of our art community!</p>
                        
                        <div class="artwork-info">
                            <h3>Artwork Details:</h3>
                            <p><strong>Name:</strong> ${itemName}</p>
                            <p><strong>Your Message:</strong> ${message}</p>
                        </div>

                        <p>To complete your account setup and access your inquiry, please:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" class="button">Verify Your Email</a>
                            <br><br>
                            <a href="${passwordCreationUrl}" class="button secondary">Create Your Password</a>
                        </div>

                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>Please verify your email first, then create your password</li>
                            <li>Both links will expire in 24 hours for security</li>
                            <li>You can use either link to complete your account setup</li>
                        </ul>

                        <p>Once your account is set up, you'll be able to:</p>
                        <ul>
                            <li>Track your art inquiries</li>
                            <li>Receive updates about your interested artwork</li>
                            <li>Access exclusive art content and auctions</li>
                            <li>Connect with galleries and artists</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>The Art Index Team</p>
                        <p><small>If you didn't request this account, please ignore this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
            `;

            try {
                await sendEmail({
                    to: email,
                    subject: "Welcome to Art Index - Complete Your Account Setup",
                    html: emailMessage,
                });
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // Continue with inquiry creation even if email fails
            }
        }

        // Create inquiry
        const inquiry = await InquiryModel.create({
            name,
            itemName,
            email,
            phone,
            message,
            userId: user._id // Link inquiry to user
        });

        const responseMessage = isNewUser 
            ? "Inquiry submitted successfully. Please check your email to complete your account setup."
            : "Inquiry submitted successfully.";

        return created(res, responseMessage, inquiry);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all inquiries
export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await InquiryModel.find().sort({ createdAt: -1 });
        return success(res, "List of inquiries", inquiries);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get a single inquiry
export const getSingleInquiry = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const inquiry = await InquiryModel.findById(req.params.id);
        if (!inquiry) {
            return notFound(res, "Inquiry not found");
        }

        return success(res, "Inquiry details", inquiry);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update an inquiry
export const updateInquiry = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const { name, itemName, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !itemName || !email || !message) {
            return badRequest(res, "All required fields must be provided.");
        }

        const inquiry = await InquiryModel.findById(req.params.id);
        if (!inquiry) {
            return notFound(res, "Inquiry not found");
        }

        const updatedInquiry = await InquiryModel.findByIdAndUpdate(
            req.params.id,
            { name, itemName, email, phone, message },
            { new: true, runValidators: true }
        );

        return success(res, "Inquiry updated successfully", updatedInquiry);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete an inquiry
export const deleteInquiry = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const inquiry = await InquiryModel.findById(req.params.id);
        if (!inquiry) {
            return notFound(res, "Inquiry not found");
        }

        await InquiryModel.findByIdAndDelete(req.params.id);
        return sendResponse(res, "Inquiry deleted successfully");
    } catch (error) {
        return unknownError(res, error.message);
    }
};
