import Offer from '../../models/Offer/offer.model.js';
import User from '../../models/Auth/User.js';
import Product from '../../models/Products/product.model.js';
import { sendEmail } from '../../Utils/sendEmail.js';

// User submits an offer
export const submitOffer = async (req, res) => {
  try {
    const { product, offerAmount, message, externalProductTitle, externalProductId, externalProductSlug } = req.body;
    const user = req.user._id;
    // Allow offer for either a product or an external product
    const offerData = {
      user,
      offerAmount,
      message,
    };
    if (product) {
      offerData.product = product;
    }
    if (externalProductTitle) {
      offerData.externalProductTitle = externalProductTitle;
    }
    if (externalProductId) {
      offerData.externalProductId = externalProductId;
    }
    if (externalProductSlug) {
      offerData.externalProductSlug = externalProductSlug;
    }
    const offer = await Offer.create(offerData);
    res.status(201).json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin gets all offers
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('user', 'email name')
      .populate('product', 'title');
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin accepts an offer
export const acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('user', 'email name');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    
    offer.status = 'accepted';
    offer.decisionAt = new Date();
    offer.adminNote = req.body.adminNote || '';
    await offer.save();

    // Send acceptance email to user
    try {
      const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Accepted - Art Index</title>
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
        .offer-details { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .offer-details h3 { color: #2d3748; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: 600; color: #4a5568; }
        .detail-value { color: #2d3748; }
        .admin-note { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .admin-note h3 { color: #2c5282; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .admin-note p { color: #2c5282; font-style: italic; }
        .next-steps { background: #fef5e7; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .next-steps h3 { color: #744210; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .next-steps ul { list-style: none; padding: 0; }
        .next-steps li { padding: 8px 0; color: #744210; position: relative; padding-left: 25px; }
        .next-steps li:before { content: "✓"; position: absolute; left: 0; color: #ed8936; font-weight: bold; font-size: 16px; }
        .footer { background: #2d3748; color: white; text-align: center; padding: 30px; }
        .footer h3 { font-size: 18px; margin-bottom: 10px; font-weight: 600; }
        .footer p { opacity: 0.8; font-size: 14px; margin-bottom: 5px; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: white; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease; }
        .social-links a:hover { opacity: 1; }
        @media (max-width: 600px) { .email-container { margin: 10px; border-radius: 8px; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p class="subtitle">Your offer has been accepted</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${offer.user.name},</div>
            
            <div class="message">Great news! We're excited to inform you that your offer has been accepted by our team.</div>
            
            <div class="success-box">
                <h2>Offer Accepted!</h2>
                <p>Your offer is now confirmed and ready to proceed</p>
            </div>
            
            <div class="offer-details">
                <h3>Offer Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Artwork:</span>
                    <span class="detail-value">${offer.externalProductTitle || 'External Product'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Your Offer Amount:</span>
                    <span class="detail-value">$${offer.offerAmount.toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Offer Date:</span>
                    <span class="detail-value">${new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Decision Date:</span>
                    <span class="detail-value">${new Date(offer.decisionAt).toLocaleDateString()}</span>
                </div>
                ${offer.message ? `
                <div class="detail-item">
                    <span class="detail-label">Your Message:</span>
                    <span class="detail-value">${offer.message}</span>
                </div>
                ` : ''}
            </div>
            
            ${offer.adminNote ? `
            <div class="admin-note">
                <h3>Admin Note</h3>
                <p>${offer.adminNote}</p>
            </div>
            ` : ''}
            
            <div class="next-steps">
                <h3>Next Steps</h3>
                <ul>
                    <li>Our team will contact you within 24-48 hours</li>
                    <li>We'll provide you with payment instructions</li>
                    <li>Once payment is confirmed, we'll arrange shipping</li>
                    <li>You'll receive tracking information for your artwork</li>
                </ul>
            </div>
            
            <div class="message">
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
        </div>
        
        <div class="footer">
            <h3>Art Index</h3>
            <p>Connecting art enthusiasts with exceptional pieces</p>
            <p>Your trusted partner in the art world</p>
            
            <div class="social-links">
                <a href="#">Website</a> | <a href="#">LinkedIn</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                <p>This email was sent to ${offer.user.email}</p>
                <p>© 2024 Art Index. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

      await sendEmail({
        to: offer.user.email,
        subject: '🎉 Your Offer Has Been Accepted - Art Index',
        html: emailContent
      });

      console.log('Offer acceptance email sent successfully to:', offer.user.email);
    } catch (emailError) {
      console.error('Failed to send offer acceptance email:', emailError);
      // Continue with the response even if email fails
    }

    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin rejects an offer
export const rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('user', 'email name');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    
    offer.status = 'rejected';
    offer.decisionAt = new Date();
    offer.adminNote = req.body.adminNote || '';
    await offer.save();

    // Send rejection email to user
    try {
      const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Update - Art Index</title>
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
        .info-box { background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%); border: 2px solid #3182ce; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
        .info-box h2 { color: #2c5282; font-size: 24px; margin-bottom: 15px; font-weight: 700; }
        .info-box p { color: #2a69ac; font-size: 16px; font-weight: 500; }
        .offer-details { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .offer-details h3 { color: #2d3748; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: 600; color: #4a5568; }
        .detail-value { color: #2d3748; }
        .admin-note { background: #fef5e7; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .admin-note h3 { color: #744210; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .admin-note p { color: #744210; font-style: italic; }
        .alternative-options { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .alternative-options h3 { color: #22543d; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .alternative-options ul { list-style: none; padding: 0; }
        .alternative-options li { padding: 8px 0; color: #22543d; position: relative; padding-left: 25px; }
        .alternative-options li:before { content: "💡"; position: absolute; left: 0; font-size: 16px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s ease; margin: 20px 0; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4); }
        .footer { background: #2d3748; color: white; text-align: center; padding: 30px; }
        .footer h3 { font-size: 18px; margin-bottom: 10px; font-weight: 600; }
        .footer p { opacity: 0.8; font-size: 14px; margin-bottom: 5px; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: white; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease; }
        .social-links a:hover { opacity: 1; }
        @media (max-width: 600px) { .email-container { margin: 10px; border-radius: 8px; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📋 Offer Update</h1>
            <p class="subtitle">Your offer status has been updated</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${offer.user.name},</div>
            
            <div class="message">Thank you for your interest in our artwork. We appreciate the time you took to submit your offer.</div>
            
            <div class="info-box">
                <h2>Offer Status Update</h2>
                <p>Unfortunately, we are unable to accept your offer at this time</p>
            </div>
            
            <div class="offer-details">
                <h3>Your Offer Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Artwork:</span>
                    <span class="detail-value">${offer.externalProductTitle || 'External Product'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Your Offer Amount:</span>
                    <span class="detail-value">$${offer.offerAmount.toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Offer Date:</span>
                    <span class="detail-value">${new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Decision Date:</span>
                    <span class="detail-value">${new Date(offer.decisionAt).toLocaleDateString()}</span>
                </div>
                ${offer.message ? `
                <div class="detail-item">
                    <span class="detail-label">Your Message:</span>
                    <span class="detail-value">${offer.message}</span>
                </div>
                ` : ''}
            </div>
            
            ${offer.adminNote ? `
            <div class="admin-note">
                <h3>Admin Note</h3>
                <p>${offer.adminNote}</p>
            </div>
            ` : ''}
            
            <div class="alternative-options">
                <h3>What's Next?</h3>
                <ul>
                    <li>Browse our extensive collection of other artworks</li>
                    <li>Consider submitting offers on similar pieces</li>
                    <li>Follow us for new arrivals and exclusive pieces</li>
                    <li>Contact our team for personalized recommendations</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="#" class="cta-button">Explore More Artworks</a>
            </div>
            
            <div class="message">
                <p>We value your interest in art and encourage you to continue exploring our collection. Our team is always available to help you find the perfect piece.</p>
            </div>
        </div>
        
        <div class="footer">
            <h3>Art Index</h3>
            <p>Connecting art enthusiasts with exceptional pieces</p>
            <p>Your trusted partner in the art world</p>
            
            <div class="social-links">
                <a href="#">Website</a> | <a href="#">LinkedIn</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                <p>This email was sent to ${offer.user.email}</p>
                <p>© 2024 Art Index. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

      await sendEmail({
        to: offer.user.email,
        subject: '📋 Your Offer Status Update - Art Index',
        html: emailContent
      });

      console.log('Offer rejection email sent successfully to:', offer.user.email);
    } catch (emailError) {
      console.error('Failed to send offer rejection email:', emailError);
      // Continue with the response even if email fails
    }

    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 