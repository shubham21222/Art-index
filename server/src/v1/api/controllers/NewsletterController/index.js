import Newsletter from '../../models/Newsletter.js';
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import ErrorHandler from '../../Utils/errorRes.js';
import { sendEmail } from '../../Utils/sendEmail.js';

// Subscribe to newsletter
export const subscribeNewsletter = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler('Email is required', 400));
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
        if (existingSubscription.isActive) {
            return next(new ErrorHandler('Email is already subscribed to newsletter', 400));
        } else {
            // Reactivate subscription
            existingSubscription.isActive = true;
            existingSubscription.unsubscribedAt = null;
            await existingSubscription.save();
            
            // Send welcome back email
            await sendEmail({
                to: email,
                subject: 'Welcome Back to Art Index Newsletter!',
                html: `
                    <h2>Welcome Back!</h2>
                    <p>Thank you for resubscribing to the Art Index newsletter. You'll now receive our latest updates about art, artists, and market insights.</p>
                    <p>Best regards,<br>The Art Index Team</p>
                `
            });

            return res.status(200).json({
                success: true,
                message: 'Successfully resubscribed to newsletter'
            });
        }
    }

    // Create new subscription
    const newsletter = await Newsletter.create({
        email: email.toLowerCase(),
        source: req.body.source || 'footer'
    });

    // Send welcome email
    await sendEmail({
        to: email,
        subject: 'Welcome to Art Index Newsletter!',
        html: `
            <h2>Welcome to Art Index!</h2>
            <p>Thank you for subscribing to our newsletter. You'll now receive our latest updates about:</p>
            <ul>
                <li>Featured artists and artworks</li>
                <li>Market insights and trends</li>
                <li>Exclusive gallery and museum updates</li>
                <li>Art fair announcements</li>
            </ul>
            <p>Best regards,<br>The Art Index Team</p>
        `
    });

    res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: newsletter
    });
});

// Unsubscribe from newsletter
export const unsubscribeNewsletter = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler('Email is required', 400));
    }

    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscription) {
        return next(new ErrorHandler('Email not found in newsletter subscriptions', 404));
    }

    if (!subscription.isActive) {
        return next(new ErrorHandler('Email is already unsubscribed', 400));
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    // Send unsubscribe confirmation email
    await sendEmail({
        to: email,
        subject: 'Unsubscribed from Art Index Newsletter',
        html: `
            <h2>Unsubscribed Successfully</h2>
            <p>You have been unsubscribed from the Art Index newsletter. We're sorry to see you go!</p>
            <p>If you change your mind, you can always resubscribe by visiting our website.</p>
            <p>Best regards,<br>The Art Index Team</p>
        `
    });

    res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
    });
});

// Get all newsletter subscriptions (Admin only)
export const getAllNewsletterSubscriptions = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const subscriptions = await Newsletter.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Newsletter.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        data: subscriptions,
        pagination: {
            currentPage: page,
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
});

// Get newsletter statistics (Admin only)
export const getNewsletterStats = catchAsyncError(async (req, res, next) => {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
    const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
    const totalSubscriptions = await Newsletter.countDocuments();
    
    // Get subscriptions by source
    const sourceStats = await Newsletter.aggregate([
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubscriptions = await Newsletter.countDocuments({
        subscribedAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
        success: true,
        data: {
            totalSubscribers,
            totalUnsubscribed,
            totalSubscriptions,
            recentSubscriptions,
            sourceStats
        }
    });
});

// Send newsletter to all subscribers (Admin only)
export const sendNewsletterToAll = catchAsyncError(async (req, res, next) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return next(new ErrorHandler('Subject and message are required', 400));
    }

    const activeSubscribers = await Newsletter.find({ isActive: true });

    if (activeSubscribers.length === 0) {
        return next(new ErrorHandler('No active subscribers found', 404));
    }

    // Send email to all active subscribers
    const emailPromises = activeSubscribers.map(subscriber => 
        sendEmail({
            to: subscriber.email,
            subject: subject,
            html: message
        })
    );

    await Promise.all(emailPromises);

    res.status(200).json({
        success: true,
        message: `Newsletter sent successfully to ${activeSubscribers.length} subscribers`
    });
});

// Delete newsletter subscription (Admin only)
export const deleteNewsletterSubscription = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const subscription = await Newsletter.findByIdAndDelete(id);

    if (!subscription) {
        return next(new ErrorHandler('Newsletter subscription not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Newsletter subscription deleted successfully'
    });
}); 