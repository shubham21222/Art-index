import Partnership from '../../models/Partnership/partnership.model.js';
import { success, badRequest, notFound, unknownError } from '../../formatters/globalResponse.js';
import { sendEmail } from '../../Utils/sendEmail.js';
import User from '../../models/Auth/User.js';

// Submit partnership request
export const submitPartnership = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            location,
            partnershipType,
            termsAccepted
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !location || !partnershipType) {
            return badRequest(res, 'All fields are required');
        }

        if (!termsAccepted) {
            return badRequest(res, 'You must accept the terms and conditions');
        }

        // Check if email already exists
        const existingPartnership = await Partnership.findOne({ email });
        if (existingPartnership) {
            return badRequest(res, 'A partnership request with this email already exists');
        }

        // Create new partnership request
        const partnership = new Partnership({
            firstName,
            lastName,
            email,
            phone,
            location,
            partnershipType,
            termsAccepted
        });

        await partnership.save();

        // Send thank you email to user
        const emailContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Partnership Request Received</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8fafc;
                    }
                    
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    
                    .header h1 {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .header .subtitle {
                        font-size: 16px;
                        opacity: 0.9;
                        font-weight: 300;
                    }
                    
                    .content {
                        padding: 40px 30px;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        color: #2d3748;
                        margin-bottom: 25px;
                        font-weight: 600;
                    }
                    
                    .message {
                        font-size: 16px;
                        color: #4a5568;
                        margin-bottom: 20px;
                        line-height: 1.7;
                    }
                    
                    .highlight-box {
                        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                        border-left: 4px solid #667eea;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 8px;
                    }
                    
                    .partnership-type {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .timeline {
                        background: #f8fafc;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .timeline h3 {
                        color: #2d3748;
                        font-size: 16px;
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    
                    .timeline ul {
                        list-style: none;
                        padding: 0;
                    }
                    
                    .timeline li {
                        padding: 8px 0;
                        color: #4a5568;
                        position: relative;
                        padding-left: 25px;
                    }
                    
                    .timeline li:before {
                        content: "✓";
                        position: absolute;
                        left: 0;
                        color: #48bb78;
                        font-weight: bold;
                        font-size: 16px;
                    }
                    
                    .contact-info {
                        background: #f0fff4;
                        border: 1px solid #c6f6d5;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                    }
                    
                    .contact-info h3 {
                        color: #22543d;
                        font-size: 16px;
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    
                    .contact-info p {
                        color: #2f855a;
                        font-size: 14px;
                    }
                    
                    .footer {
                        background: #2d3748;
                        color: white;
                        text-align: center;
                        padding: 30px;
                    }
                    
                    .footer h3 {
                        font-size: 18px;
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    
                    .footer p {
                        opacity: 0.8;
                        font-size: 14px;
                        margin-bottom: 5px;
                    }
                    
                    .social-links {
                        margin-top: 20px;
                    }
                    
                    .social-links a {
                        display: inline-block;
                        margin: 0 10px;
                        color: white;
                        text-decoration: none;
                        font-size: 14px;
                        opacity: 0.8;
                        transition: opacity 0.3s ease;
                    }
                    
                    .social-links a:hover {
                        opacity: 1;
                    }
                    
                    .divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                        margin: 30px 0;
                    }
                    
                    @media (max-width: 600px) {
                        .email-container {
                            margin: 10px;
                            border-radius: 8px;
                        }
                        
                        .header, .content, .footer {
                            padding: 20px;
                        }
                        
                        .header h1 {
                            font-size: 24px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>🎨 Partnership Request Received!</h1>
                        <p class="subtitle">Welcome to the Art Index family</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Dear ${firstName} ${lastName},
                        </div>
                        
                        <div class="message">
                            Thank you for submitting your partnership request with <strong>Art Index</strong>. We're excited to have you join our growing community of art professionals!
                        </div>
                        
                        <div class="highlight-box">
                            <strong>Partnership Type:</strong> 
                            <span class="partnership-type">${partnershipType}</span>
                        </div>
                        
                        <div class="message">
                            We have received your application and our dedicated team is already reviewing your request. We're committed to providing you with a response within our standard timeframe.
                        </div>
                        
                        <div class="timeline">
                            <h3>📋 What happens next?</h3>
                            <ul>
                                <li>Our team will review your application thoroughly</li>
                                <li>We'll assess your partnership requirements</li>
                                <li>You'll receive a detailed response within 3-5 business days</li>
                                <li>Upon approval, you'll get access to our partner dashboard</li>
                            </ul>
                        </div>
                        
                        <div class="contact-info">
                            <h3>💬 Need to reach us?</h3>
                            <p>If you have any questions or need to provide additional information, please don't hesitate to contact our partnership team.</p>
                        </div>
                        
                        <div class="message">
                            We appreciate your interest in partnering with Art Index and look forward to potentially working together to bring exceptional art experiences to our community.
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div style="text-align: center; color: #718096; font-size: 14px;">
                            <p><strong>Application Reference:</strong> ${partnership._id}</p>
                            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <h3>Art Index</h3>
                        <p>Connecting art professionals worldwide</p>
                        <p>Your trusted partner in the art industry</p>
                        
                        <div class="social-links">
                            <a href="#">Website</a> |
                            <a href="#">LinkedIn</a> |
                            <a href="#">Twitter</a> |
                            <a href="#">Instagram</a>
                        </div>
                        
                        <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                            <p>This email was sent to ${email}</p>
                            <p>© 2024 Art Index. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await sendEmail({
                to: email,
                subject: 'Partnership Request Received - Art Index',
                html: emailContent
            });

            // Update email sent status
            partnership.emailSent = true;
            await partnership.save();
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue with the request even if email fails
        }

        return success(res, 'Partnership request submitted successfully. You will receive a confirmation email shortly.', partnership);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all partnership requests (Admin only)
export const getAllPartnerships = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, partnershipType } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (partnershipType) {
            query.partnershipType = partnershipType;
        }

        const partnerships = await Partnership.find(query)
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Partnership.countDocuments(query);

        return success(res, 'Partnerships retrieved successfully', {
            partnerships,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPartnerships: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get partnership by ID
export const getPartnershipById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const partnership = await Partnership.findById(id)
            .populate('approvedBy', 'name email');
            
        if (!partnership) {
            return notFound(res, 'Partnership request not found');
        }

        return success(res, 'Partnership retrieved successfully', partnership);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Approve partnership request (Admin only)
export const approvePartnership = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;

        const partnership = await Partnership.findById(id);
        if (!partnership) {
            return notFound(res, 'Partnership request not found');
        }

        if (partnership.status !== 'pending') {
            return badRequest(res, 'Partnership request has already been processed');
        }

        // Update partnership status
        partnership.status = 'approved';
        partnership.approvedBy = adminId;
        partnership.approvedAt = new Date();
        partnership.rejectionReason = undefined;

        await partnership.save();

        // Create user account for approved partnership
        const userData = {
            name: `${partnership.firstName} ${partnership.lastName}`,
            email: partnership.email,
            role: partnership.partnershipType === 'sponsors' ? 'SPONSOR' : partnership.partnershipType.toUpperCase(), // SPONSOR, AUCTIONS, FAIRS, MUSEUMS, GALLERIES
            partnershipType: partnership.partnershipType,
            isPartner: true,
            partnerApprovedAt: new Date()
        };

        // Check if user already exists
        let user = await User.findOne({ email: partnership.email });
        let isNewUser = false;
        
        if (user) {
            // Update existing user
            user.role = partnership.partnershipType === 'sponsors' ? 'SPONSOR' : partnership.partnershipType.toUpperCase();
            user.partnershipType = partnership.partnershipType;
            user.isPartner = true;
            user.partnerApprovedAt = new Date();
            await user.save();
        } else {
            // Create new user
            user = new User(userData);
            await user.save();
            isNewUser = true;
            
            // Generate password reset token for new user
            const resetToken = user.getResetPasswordToken();
            await user.save();
        }

        // Send approval email
        const createPasswordLink = isNewUser ? `https://artindex.ai/create-password/${user.passwordResetToken}` : null;
        
        const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partnership Approved!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header .subtitle { font-size: 16px; opacity: 0.9; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2d3748; margin-bottom: 25px; font-weight: 600; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 20px; line-height: 1.7; }
        .success-box { background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); border: 2px solid #48bb78; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
        .success-box h2 { color: #22543d; font-size: 24px; margin-bottom: 15px; font-weight: 700; }
        .success-box p { color: #2f855a; font-size: 16px; font-weight: 500; }
        .account-info { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .account-info h3 { color: #2d3748; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .account-details { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px; }
        .detail-item { flex: 1; min-width: 200px; }
        .detail-label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 5px; }
        .detail-value { font-size: 16px; color: #2d3748; font-weight: 600; }
        .partnership-type { display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .next-steps { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .next-steps h3 { color: #2c5282; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .next-steps ul { list-style: none; padding: 0; }
        .next-steps li { padding: 8px 0; color: #2c5282; position: relative; padding-left: 25px; }
        .next-steps li:before { content: "→"; position: absolute; left: 0; color: #3182ce; font-weight: bold; font-size: 16px; }
        .create-password-box { background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%); border: 2px solid #ed8936; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
        .create-password-box h3 { color: #744210; font-size: 20px; margin-bottom: 15px; font-weight: 700; }
        .create-password-box p { color: #744210; font-size: 16px; margin-bottom: 20px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3); transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(237, 137, 54, 0.4); }
        .footer { background: #2d3748; color: white; text-align: center; padding: 30px; }
        .footer h3 { font-size: 18px; margin-bottom: 10px; font-weight: 600; }
        .footer p { opacity: 0.8; font-size: 14px; margin-bottom: 5px; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: white; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease; }
        .social-links a:hover { opacity: 1; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 30px 0; }
        @media (max-width: 600px) { .email-container { margin: 10px; border-radius: 8px; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } .account-details { flex-direction: column; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p class="subtitle">Your partnership has been approved</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${partnership.firstName} ${partnership.lastName},</div>
            
            <div class="success-box">
                <h2>Welcome to Art Index!</h2>
                <p>We are thrilled to inform you that your partnership request has been <strong>APPROVED</strong>!</p>
            </div>
            
            <div class="message">Thank you for your patience during our review process. We're excited to have you join our community of art professionals and look forward to a successful partnership.</div>
            
            <div class="account-info">
                <h3>📋 Your Account Details</h3>
                <div class="account-details">
                    <div class="detail-item">
                        <div class="detail-label">Email Address</div>
                        <div class="detail-value">${partnership.email}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Account Type</div>
                        <div class="detail-value"><span class="partnership-type">${partnership.partnershipType}</span></div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Approval Date</div>
                        <div class="detail-value">${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
            
            ${isNewUser ? `
            <div class="create-password-box">
                <h3>🔐 Set Up Your Account</h3>
                <p>Since this is your first time with Art Index, you'll need to create a password to access your account.</p>
                <a href="${createPasswordLink}" class="cta-button">Create Password</a>
                <p style="margin-top: 15px; font-size: 14px; color: #744210;">This link will expire in 15 minutes for security reasons.</p>
            </div>
            ` : `
            <div class="next-steps">
                <h3>🚀 Next Steps</h3>
                <ul>
                    <li>Log in to your Art Index account using your email address</li>
                    <li>Complete your profile setup in the partner dashboard</li>
                    <li>Explore our partner resources and tools</li>
                    <li>Start creating and managing your content</li>
                </ul>
            </div>
            `}
            
            <div class="message">Our team will be in touch shortly with additional onboarding information and resources to help you get started.</div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
                <p><strong>Partnership ID:</strong> ${partnership._id}</p>
                <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${isNewUser ? `<p><strong>Account Status:</strong> New User - Password Setup Required</p>` : `<p><strong>Account Status:</strong> Existing User</p>`}
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
                <p>This email was sent to ${partnership.email}</p>
                <p>© 2024 Art Index. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        try {
            await sendEmail({
                to: partnership.email,
                subject: 'Partnership Approved - Welcome to Art Index!',
                html: emailContent
            });

            // Update approval email sent status
            partnership.approvalEmailSent = true;
            await partnership.save();
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // Continue with the approval even if email fails
        }

        return success(res, 'Partnership approved successfully. User account created and notification email sent.', {
            partnership,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                partnershipType: user.partnershipType,
                isNewUser: isNewUser,
                needsPasswordSetup: isNewUser
            }
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Reject partnership request (Admin only)
export const rejectPartnership = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;

        if (!rejectionReason) {
            return badRequest(res, 'Rejection reason is required');
        }

        const partnership = await Partnership.findById(id);
        if (!partnership) {
            return notFound(res, 'Partnership request not found');
        }

        if (partnership.status !== 'pending') {
            return badRequest(res, 'Partnership request has already been processed');
        }

        // Update partnership status
        partnership.status = 'rejected';
        partnership.approvedBy = adminId;
        partnership.approvedAt = new Date();
        partnership.rejectionReason = rejectionReason;

        await partnership.save();

        // Send rejection email
        const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partnership Request Update</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header .subtitle { font-size: 16px; opacity: 0.9; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2d3748; margin-bottom: 25px; font-weight: 600; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 20px; line-height: 1.7; }
        .update-box { background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); border: 2px solid #f56565; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
        .update-box h2 { color: #742a2a; font-size: 24px; margin-bottom: 15px; font-weight: 700; }
        .update-box p { color: #742a2a; font-size: 16px; font-weight: 500; }
        .reason-box { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .reason-box h3 { color: #742a2a; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .reason-text { background: white; border: 1px solid #fed7d7; border-radius: 6px; padding: 15px; color: #742a2a; font-style: italic; }
        .encouragement { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .encouragement h3 { color: #2c5282; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .encouragement p { color: #2c5282; font-size: 14px; }
        .next-opportunity { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .next-opportunity h3 { color: #22543d; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .next-opportunity ul { list-style: none; padding: 0; }
        .next-opportunity li { padding: 8px 0; color: #22543d; position: relative; padding-left: 25px; }
        .next-opportunity li:before { content: "💡"; position: absolute; left: 0; font-size: 16px; }
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
            <h1>📋 Partnership Request Update</h1>
            <p class="subtitle">Important information about your application</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${partnership.firstName} ${partnership.lastName},</div>
            
            <div class="message">Thank you for your interest in partnering with Art Index. We appreciate the time and effort you put into your application.</div>
            
            <div class="update-box">
                <h2>Application Status Update</h2>
                <p>After careful review, we regret to inform you that we are unable to approve your partnership request at this time.</p>
            </div>
            
            <div class="reason-box">
                <h3>📝 Review Feedback</h3>
                <div class="reason-text">"${rejectionReason}"</div>
            </div>
            
            <div class="encouragement">
                <h3>💪 We Believe in You</h3>
                <p>This decision is not a reflection of your potential or capabilities. We encourage you to review our partnership criteria and consider applying again in the future.</p>
            </div>
            
            <div class="next-opportunity">
                <h3>🚀 Future Opportunities</h3>
                <ul>
                    <li>Review and strengthen your application based on our feedback</li>
                    <li>Consider reapplying in 3-6 months</li>
                    <li>Stay updated with our partnership opportunities</li>
                    <li>Connect with us on social media for updates</li>
                </ul>
            </div>
            
            <div class="message">We value your interest in Art Index and hope to have the opportunity to work together in the future. Thank you for understanding.</div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
                <p><strong>Application ID:</strong> ${partnership._id}</p>
                <p><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
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
                <p>This email was sent to ${partnership.email}</p>
                <p>© 2024 Art Index. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        try {
            await sendEmail({
                to: partnership.email,
                subject: 'Partnership Request Update - Art Index',
                html: emailContent
            });
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
            // Continue with the rejection even if email fails
        }

        return success(res, 'Partnership rejected successfully. Notification email sent.', partnership);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get partnership statistics (Admin only)
export const getPartnershipStats = async (req, res) => {
    try {
        const stats = await Partnership.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const typeStats = await Partnership.aggregate([
            {
                $group: {
                    _id: '$partnershipType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalPartnerships = await Partnership.countDocuments();
        const pendingPartnerships = await Partnership.countDocuments({ status: 'pending' });
        const approvedPartnerships = await Partnership.countDocuments({ status: 'approved' });
        const rejectedPartnerships = await Partnership.countDocuments({ status: 'rejected' });

        return success(res, 'Partnership statistics retrieved successfully', {
            total: totalPartnerships,
            pending: pendingPartnerships,
            approved: approvedPartnerships,
            rejected: rejectedPartnerships,
            byType: typeStats,
            byStatus: stats
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
}; 