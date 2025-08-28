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

        // Send confirmation email to existing users (not just new users)
        if (!isNewUser) {
            try {
                const confirmationEmail = `
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
                            <h1>Thank You for Your Inquiry</h1>
                            <p>We've received your interest in our artwork</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${name},</h2>
                            <p>Thank you for your inquiry about <strong>${itemName}</strong>. We have received your request and our team will review it shortly.</p>
                            
                            <div class="artwork-info">
                                <h3>Inquiry Details:</h3>
                                <p><strong>Artwork:</strong> ${itemName}</p>
                                <p><strong>Your Message:</strong> ${message}</p>
                                <p><strong>Inquiry Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>

                            <p>We will contact you soon with more information about this artwork and answer any questions you may have.</p>
                            
                            <p>If you have any urgent questions, please don't hesitate to reach out to us.</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>The Art Index Team</p>
                            <p><small>This is an automated confirmation email. Please do not reply to this message.</small></p>
                        </div>
                    </div>
                </body>
                </html>
                `;

                await sendEmail({
                    to: email,
                    subject: "Thank you for your inquiry - Art Index",
                    html: confirmationEmail,
                });
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue with inquiry creation even if email fails
            }
        }

        // Send admin notification email
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'hello@nyelizabeth.com';
            const adminNotification = `
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
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #666;
                        border-top: 1px solid #e9ecef;
                    }
                    .inquiry-info {
                        background-color: #fff3cd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #ffc107;
                    }
                    .contact-info {
                        background-color: #d1ecf1;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #17a2b8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Artwork Inquiry Received</h1>
                        <p>Someone is interested in artwork on Art Index</p>
                    </div>
                    <div class="content">
                        <h2>New Inquiry Details</h2>
                        
                        <div class="contact-info">
                            <h3>Contact Information:</h3>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                            <p><strong>User Type:</strong> ${isNewUser ? 'New User' : 'Existing User'}</p>
                        </div>

                        <div class="inquiry-info">
                            <h3>Artwork Information:</h3>
                            <p><strong>Artwork:</strong> ${itemName}</p>
                            <p><strong>Message:</strong> ${message}</p>
                            <p><strong>Inquiry Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Inquiry Time:</strong> ${new Date().toLocaleTimeString()}</p>
                        </div>

                        <p><strong>Action Required:</strong> Please review this inquiry and respond to the customer as soon as possible.</p>
                        
                        <p>You can access all inquiries through the admin dashboard.</p>
                    </div>
                    <div class="footer">
                        <p>Art Index Admin Notification</p>
                        <p><small>This is an automated notification. Please do not reply to this message.</small></p>
                    </div>
                </div>
            </body>
            </html>
            `;

            await sendEmail({
                to: adminEmail,
                subject: `New Inquiry: ${itemName} - ${name}`,
                html: adminNotification,
            });
        } catch (adminEmailError) {
            console.error('Error sending admin notification email:', adminEmailError);
            // Continue with inquiry creation even if admin email fails
        }

        const responseMessage = isNewUser 
            ? "Inquiry submitted successfully. Please check your email to complete your account setup."
            : "Inquiry submitted successfully. You will receive a confirmation email shortly.";

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

        const { name, itemName, email, phone, message, response, status } = req.body;

        // Validate required fields
        if (!name || !itemName || !email || !message) {
            return badRequest(res, "All required fields must be provided.");
        }

        const inquiry = await InquiryModel.findById(req.params.id);
        if (!inquiry) {
            return notFound(res, "Inquiry not found");
        }

        // Prepare update data
        const updateData = { name, itemName, email, phone, message };
        
        // If status is being updated to 'responded' and response is provided, include them
        if (status === 'responded' && response) {
            updateData.status = status;
            updateData.response = response;
            updateData.respondedAt = new Date();
        }

        const updatedInquiry = await InquiryModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Send response email if status is 'responded' and response is provided
        if (status === 'responded' && response) {
            try {
                console.log('Sending response email to:', email);
                console.log('Response content:', response);
                console.log('Inquiry details:', {
                    id: inquiry._id,
                    name: name,
                    itemName: itemName,
                    email: email
                });
                
                const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Response - Art Index</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header .subtitle { font-size: 16px; opacity: 0.9; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2d3748; margin-bottom: 25px; font-weight: 600; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 20px; line-height: 1.7; }
        .response-box { background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); border: 2px solid #48bb78; padding: 25px; margin: 25px 0; border-radius: 12px; }
        .response-box h3 { color: #22543d; font-size: 18px; margin-bottom: 15px; font-weight: 600; }
        .response-text { background: white; border: 1px solid #c6f6d5; border-radius: 8px; padding: 20px; color: #22543d; font-style: italic; line-height: 1.6; }
        .inquiry-details { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .inquiry-details h3 { color: #2d3748; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: 600; color: #4a5568; }
        .footer { background: #2d3748; color: white; text-align: center; padding: 30px; }
        .footer h3 { font-size: 18px; margin-bottom: 10px; font-weight: 600; }
        .footer p { opacity: 0.8; font-size: 14px; margin-bottom: 5px; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: white; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease; }
        .social-links a:hover { opacity: 1; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 30px 0; }
        @media (max-width: 600px) { .email-container { margin: 10px; border-radius: 8px; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📧 Inquiry Response</h1>
            <p class="subtitle">We've responded to your inquiry</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${name},</div>
            
            <div class="message">Thank you for your inquiry about <strong>${itemName}</strong>. We appreciate your interest in our artwork and are pleased to provide you with a response.</div>
            
            <div class="response-box">
                <h3>💬 Our Response</h3>
                <div class="response-text">${response}</div>
            </div>
            
            <div class="inquiry-details">
                <h3>📋 Inquiry Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Artwork:</span> ${itemName}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Your Message:</span> ${message}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Response Date:</span> ${new Date().toLocaleDateString()}
                </div>
            </div>
            
            <div class="message">If you have any additional questions or need further clarification, please don't hesitate to reach out to us. We're here to help!</div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
                <p><strong>Inquiry ID:</strong> ${inquiry._id}</p>
                <p><strong>Response Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        
        <div class="footer">
            <h3>Art Index</h3>
            <p>Connecting art professionals worldwide</p>
            <p>Your trusted partner in the art industry</p>
            
            <div class="social-links">
                <a href="#">Website</a> | <a href="#">LinkedIn</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                <p>This email was sent to ${email}</p>
                <p>© 2024 Art Index. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

                console.log('Email content prepared, length:', emailContent.length);

                const emailResult = await sendEmail({
                    to: email,
                    subject: `Response to Your Inquiry - ${itemName}`,
                    html: emailContent
                });

                console.log('Response email sent successfully:', emailResult);

                // Update response email sent status
                updatedInquiry.responseEmailSent = true;
                await updatedInquiry.save();
                console.log('Response email sent status updated in database');

            } catch (emailError) {
                console.error('Failed to send response email:', emailError);
                console.error('Email error details:', {
                    message: emailError.message,
                    stack: emailError.stack,
                    inquiryId: inquiry._id,
                    email: email
                });
                // Continue with the update even if email fails
            }
        }

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
