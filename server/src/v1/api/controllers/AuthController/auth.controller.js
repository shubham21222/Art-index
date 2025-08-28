import User from  "../../models/Auth/User.js"
import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"
import {validateMongoDbId} from "../../Utils/validateMongodbId.js"
import { generateToken, verifyToken } from "../../config/jwt.js"
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {sendToken}  from  "../../Utils/genToken.js"
import {sendEmail} from "../../Utils/sendEmail.js"
import crypto from 'crypto'



const generateResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
  };

// Register User //
export const register = async (req, res , next) => {
    const { email, password, name } = req.body;
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return badRequest(res, 'User already exists');
        }

        if(!email || !password || !name){
            return badRequest(res, 'Please provide name, email and password');
        }

        // Generate verification token
        const verificationToken = generateResetPasswordToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const userData = {
            email,
            name: name,
            role: req.body.role || "USER",
            passwordResetToken: verificationToken,
            passwordResetExpires: verificationExpires,
        }

        if(password){
            userData.password = password;
        }

        // Create the new user
        const newUser = await User.create(userData);

        // Send verification email
        const verificationUrl = `https://artindex.ai/verify-email/${verificationToken}`;
        
        const message = `
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
                    margin: 0 auto;
                    padding: 20px;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #000;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 30px;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #000;
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    background-color: #f8f8f8;
                    padding: 20px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to ArtIndex!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for registering with ArtIndex. To complete your registration and verify your email address, please click the button below:</p>
                    
                    <div style="text-align: center;">
                        <a class="button" href="${verificationUrl}">Verify Your Email</a>
                    </div>
                    
                    <p>This verification link will expire in <strong>24 hours</strong> for security reasons.</p>
                    
                    <p>If you did not create an account with ArtIndex, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The ArtIndex Team</p>
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            await sendEmail({
                to: email,
                subject: "Verify Your Email - ArtIndex",
                html: message,
            });

            return success(res, "Registration successful! Please check your email to verify your account.", {
                success: true,
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
                message: "Please check your email to verify your account"
            });
        } catch (error) {
            // If email fails, still create user but inform about email issue
            console.error('Email sending failed:', error);
            return success(res, "Registration successful! However, verification email could not be sent. Please contact support.", {
                success: true,
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
                message: "Registration successful but verification email failed"
            });
        }

    } catch (error) {
        next(error);
    }
}


// Login Token //

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return badRequest(res, "Please provide an email and password");
        }


        // Find user by email and select password field explicitly
        const findUser = await User.findOne({ email }).select("+password");

        // If user not found, return an error
        if (!findUser) {
            return badRequest(res, "Invalid email ");
        }

        // If user exists but has no password (e.g., social login users)
        if (!findUser.password) {
            const token = findUser.getSignedToken();

            await User.findByIdAndUpdate(
                findUser._id.toString(),
                { activeToken: token },
                { new: true }
            );

            return success(res, "Login Successful", {
                success: true,
                user: {
                    _id: findUser._id,
                    name: findUser.name,
                    email: findUser.email,
                    role: findUser.role,
                    passwordResetToken: findUser.passwordResetToken,
                },
                token: token,
            });
        }

        // Validate password
        const isMatch = await findUser.matchPassword(password);
        if (!isMatch) {
            return badRequest(res, "Invalid password");
        }

        // Generate token and update activeToken in DB
        const token = findUser.getSignedToken();

        await User.findByIdAndUpdate(
            findUser._id.toString(),
            { activeToken: token },
            { new: true }
        );

        return success(res, "Login Successful", {
            success: true,
            user: {
                _id: findUser._id,
                name: findUser.name,
                email: findUser.email,
                role: findUser.role,
                passwordResetToken: findUser.passwordResetToken,
            },
            token: token,
        });
        

    } catch (error) {
        unknownError(res, error);
    }
};


// Logout User //

export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if(!authHeader){
            return badRequest(res, "No token provided");
        }

        let token ;

       if(authHeader){
        token = authHeader;
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       console.log("Logout debug:", { decoded, token });
       const userData = await User.findOne({ _id: decoded?._id });
       if(userData && userData.activeToken && userData.activeToken === token){
          const user = await User.findByIdAndUpdate(userData._id, { activeToken: null }, { new: true });
          if(!user){
              return badRequest(res, "Invalid token , Please login again");
          }

          return success(res, "User logged out successfully");
       }
       else{
              if (!userData) {
                  return badRequest(res, "User not found");
              }
              return badRequest(res, "Invalid token , Please login again");
       }

    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            return badRequest(res, "Invalid token , Please login again");
        }
        else if (error.name === "TokenExpiredError"){
            return badRequest(res, "Token expired , Please login again");
        }

        else{
            unknownError(res, error);
        }
    }
}


// verify User //

export const verifyUser = async (req, res, next) => {
    const {token} = req.params;
    if(!token){
        return badRequest(res, "Invalid token");
    }
    try{

        const decoded = verifyToken(token);
        if(!decoded){
            return badRequest(res, "Invalid token");
        }

        const {_id} = decoded;
        console.log("Verify debug:", { token, decoded, userId: _id });
        
        // First try to find user with exact token match
        let loggedInUser = await User.findOne({
            _id: _id,
            activeToken: token
        }).select("-password -activeToken");

        // If not found and it's a Google user, try without token match
        if (!loggedInUser) {
            loggedInUser = await User.findById(_id).select("-password -activeToken");
            if (loggedInUser && loggedInUser.googleId) {
                console.log("Found Google user without token match:", loggedInUser.email);
            }
        }

        if(!loggedInUser){
            return badRequest(res, "Invalid token");
        }

        return success(res, "User verified successfully", loggedInUser);

    }
    catch(error){
        console.error("Verify error:", error);
        unknownError(res, error);
    }
}


// Forgot Password //



// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return badRequest(res, "Please provide an email.");
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return badRequest(res, "User not found.");
        }

        // Generate reset password token
        const resetToken = user.getResetPasswordToken();
        console.log(resetToken);
        await user.save({ validateBeforeSave: false });

        // Construct reset URL
        const resetUrl = `https://artindex.ai/reset-password/${resetToken}`;

        // Email Template
        const message = `
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
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #000;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 30px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #000;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>We have received a request to reset your password for your account on <strong>ArtIndex</strong>. If you did not request this change, you can safely ignore this email and your password will not be changed.</p>
            
            <p>To reset your password, please click the button below and follow the instructions:</p>
            
            <div style="text-align: center;">
                <a class="button" href="${resetUrl}">Reset Password</a>
            </div>
            
            <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The ArtIndex Team</p>
        </div>
    </div>
</body>
</html>
    `;

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request - ArtIndex",
                html: message, // Sending as HTML
            });

            return success(res, "Password reset email sent successfully.");
        } catch (error) {
            // Reset token values if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return unknownError(res, "Email could not be sent. Please try again later.");
        }
    } catch (error) {
        return unknownError(res, error.message || "Something went wrong.");
    }
};


// Reset Password //

export const resetPassword = async (req, res , next) => {

    try {

        const { resetToken } = req.params;
        const { password } = req.body;


        if (!resetToken || !password) {
            return badRequest(res, "Invalid token or password");
        }

        const user = await User.findOne({
            passwordResetToken: resetToken,
            passwordResetExpires: { $gt: Date.now() },
        })

        if (!user) {
            return badRequest(res, "Invalid token or token expired");
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return success(res, "Password reset successfully");

        
    } catch (error) {

        unknownError(res, error);
        
    }

}


//Update User Profile //

export const updateProfile = async (req, res, next) => {
    try {
        const { _id } = req.user._id; // Correct destructuring
            validateMongoDbId(_id); // Ensuring a valid MongoDB ID
      

        const { name, email } = req.body;

        if (!name?.trim() && !email?.trim()) {
            return badRequest(res, "Please provide a valid name or email to update");
        }

        // Construct the update object dynamically
        const updatedFields = {};
        if (name?.trim()) updatedFields.name = name.trim();
        if (email?.trim()) updatedFields.email = email.trim();

        const user = await User.findByIdAndUpdate(_id, updatedFields, {
            new: true,
            runValidators: true,
        });

        return sendResponse(res, 200, true, "Profile updated successfully", "", user);
    } catch (error) {
        return unknownError(res, error);
    }
};



// Update Password //

export const updatePassword = async (req, res, next) => {
    try {
        // Extract user ID from request
        const { _id } = req.user._id;
        validateMongoDbId(_id); // Ensure it's a valid MongoDB ID

        // Extract password fields from request body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return badRequest(res, "Please provide old password, new password, and confirm password");
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return badRequest(res, "New password and confirm password do not match");
        }

        // Find user by ID and include password field
        const user = await User.findById(_id).select("+password");
        if (!user) {
            return badRequest(res, "User not found");
        }

        // Validate old password
        const isPasswordMatch = await user.matchPassword(oldPassword);
        if (!isPasswordMatch) {
            return badRequest(res, "Invalid old password");
        }

        // Update password and set password change timestamp
        user.password = newPassword;
        user.passwordChangedAt = Date.now();

        // Save updated user details
        await user.save();

        return success(res, "Password updated successfully");

    } catch (error) {
        unknownError(res, error);
    }
};


// Update Billing Address //

export const updateBillingAddress = async (req, res, next) => {
    try {
        const { _id } = req.user._id;



        console.log("Id" , _id)
        validateMongoDbId(_id);

        const { BillingDetails } = req.body;

        if (!BillingDetails) {
            return badRequest(res, "Please provide a valid billing address to update");
        }

        const user = await User.findByIdAndUpdate(
            _id,
            { BillingDetails },
            { new: true, runValidators: true }
        );

        return success(res, "Billing address updated successfully", user);
    } catch (error) {
        unknownError(res, error);
    }
}

// get All Users //

// Controller function to get all users with sorting, pagination, and search
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search } = req.query;
        const skip = (page - 1) * limit;
        const sortOrder = order == 'asc' ? 1 : -1;

        let matchQuery = {};
        

        if (search) {
            matchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.aggregate([
            { $match: matchQuery },

            // Lookup auctions created by the user
            {
                $lookup: {
                    from: 'auctions',
                    localField: '_id',
                    foreignField: 'createdBy',
                    as: 'userAuctions'
                }
            },

            // Lookup products associated with those auctions
            {
                $lookup: {
                    from: 'products',
                    localField: 'userAuctions.product',
                    foreignField: '_id',
                    as: 'auctionProducts'
                }
            },

            // Lookup orders made by the user
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'userOrders'
                }
            },

            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    mobile: 1,
                    walletBalance: 1,
                    Payment_Status: 1,
                    createdAt: 1,

                    userAuctions: {
                        $map: {
                            input: { $ifNull: ["$userAuctions", []] },
                            as: "auction",
                            in: {
                                product: {
                                    title: {
                                        $ifNull: [
                                            { $arrayElemAt: ["$auctionProducts.title", 0] },
                                            ""
                                        ]
                                    },
                                    price: {
                                        $ifNull: [
                                            { $arrayElemAt: ["$auctionProducts.price", 0] },
                                            0
                                        ]
                                    }
                                },
                                auctionType: { $ifNull: ["$$auction.auctionType", ""] },
                                lotNumber: { $ifNull: ["$$auction.lotNumber", ""] },
                                createdBy: { $ifNull: ["$$auction.createdBy", ""] },
                                status: { $ifNull: ["$$auction.status", ""] }
                            }
                        }
                    },

                    userOrders: {
                        $map: {
                            input: { $ifNull: ["$userOrders", []] },
                            as: "order",
                            in: {
                                paymentStatus: { $ifNull: ["$$order.paymentStatus", ""] },
                                OrderId: { $ifNull: ["$$order.OrderId", ""] },
                                totalAmount: { $ifNull: ["$$order.totalAmount", 0] },
                                products: { $ifNull: ["$$order.products", []] }
                            }
                        }
                    }
                }
            },

            { $sort: { [sortBy]: sortOrder } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const totalUsers = await User.countDocuments(matchQuery);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                totalUsers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// get user by id //

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);


        const user = await
            User.findById(id).select("-password -activeToken");


        if (!user) {
            return notFound(res, 'User not found');
        }

        return success(res, "User found", user);

    }
    catch (error) {
        onError(res, error);
    }
}


// get user by Billing Address //

export const getUserByBillingAddress = async (req, res, next) => {
    try {
        
        const {id} = req.params;
        validateMongoDbId(id);

        const user = await User.findById(id).select("BillingDetails");
        if(!user){
        return notFound(res, "User not found");
        }

        return success(res, "User found", user);
        
    } catch (error) {
        return unknownError(res, error);  
    }
}

// Get Current User (me) //
export const getCurrentUser = async (req, res, next) => {
    try {
        // User is already attached to req by IsAuthenticated middleware
        const user = await User.findById(req.user._id).select("-password -activeToken");
        
        if (!user) {
            return notFound(res, "User not found");
        }

        return success(res, "User found", user);
        
    } catch (error) {
        return unknownError(res, error);
    }
}

// Verify Email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return badRequest(res, "Invalid verification token");
        }

        // Find user by verification token (stored in passwordResetToken field)
        const user = await User.findOne({ 
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return badRequest(res, "Invalid verification token or token expired");
        }

        // Clear the verification token and mark email as verified
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // You might want to add an emailVerified field to the User model
        // user.emailVerified = true;
        await user.save();

        return success(res, "Email verified successfully. You can now log in to your account.");
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Create Password (for new users from inquiry)
export const createPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return badRequest(res, "Please provide token, password, and confirm password");
        }

        if (password !== confirmPassword) {
            return badRequest(res, "Passwords do not match");
        }

        if (password.length < 6) {
            return badRequest(res, "Password must be at least 6 characters long");
        }

        // Find user by password reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return badRequest(res, "Invalid token or token expired");
        }

        // Set password and clear tokens
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.activeToken = null; // Clear any verification token as well
        await user.save();

        // Generate login token
        const loginToken = user.getSignedToken();

        return success(res, "Password created successfully. You are now logged in.", {
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: loginToken,
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all sponsors (admin only)
export const getAllSponsors = async (req, res, next) => {
    try {
        const sponsors = await User.find({ role: "SPONSOR" }).select('-password');
        return success(res, 'Sponsors retrieved successfully', { items: sponsors });
    } catch (error) {
        return onError(res, error);
    }
};

// Get all users with filtering and pagination (admin only)
export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const skip = (page - 1) * limit;
        
        console.log('getAllUsersAdmin request:', { page, limit, role, search, skip });

        let query = {};
        
        // Filter by role if specified
        if (role && role !== 'all') {
            query.role = role.toUpperCase();
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Database query:', JSON.stringify(query));

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);
        
        console.log('Database results:', { usersFound: users.length, totalUsers: total });

        const response = {
            items: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit),
            }
        };
        
        console.log('Sending response:', { 
            status: true, 
            itemsCount: response.items.length, 
            pagination: response.pagination 
        });

        return success(res, 'Users retrieved successfully', response);
    } catch (error) {
        console.error('Error in getAllUsersAdmin:', error);
        return onError(res, error);
    }
};

// Get user statistics (admin only)
export const getUserStats = async (req, res, next) => {
    try {
        console.log('getUserStats request received');
        
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
        const totalSponsors = await User.countDocuments({ role: 'SPONSOR' });
        const totalGalleries = await User.countDocuments({ role: { $in: ['GALLERY', 'GALLERIES'] } });
        const totalMuseums = await User.countDocuments({ role: 'MUSEUMS' });
        const totalAuctions = await User.countDocuments({ role: 'AUCTIONS' });
        const totalFairs = await User.countDocuments({ role: 'FAIRS' });
        const totalRegularUsers = await User.countDocuments({ role: 'USER' });

        const response = {
            total: totalUsers,
            byRole: stats,
            breakdown: {
                admins: totalAdmins,
                sponsors: totalSponsors,
                galleries: totalGalleries,
                museums: totalMuseums,
                auctions: totalAuctions,
                fairs: totalFairs,
                regularUsers: totalRegularUsers
            }
        };
        
        console.log('User stats calculated:', { 
            totalUsers, 
            totalAdmins, 
            totalSponsors, 
            totalGalleries, 
            totalMuseums, 
            totalAuctions, 
            totalFairs, 
            totalRegularUsers 
        });
        console.log('Sending stats response:', { status: true, itemsCount: Object.keys(response).length });

        return success(res, 'User statistics retrieved successfully', response);
    } catch (error) {
        console.error('Error in getUserStats:', error);
        return onError(res, error);
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('Delete user request received:', { id, params: req.params, user: req.user?._id });
        
        // Validate MongoDB ID - this function throws an error if invalid
        try {
            validateMongoDbId(id);
            console.log('MongoDB ID validation passed for:', id);
        } catch (error) {
            console.log('MongoDB ID validation failed for:', id, 'Error:', error.message);
            return badRequest(res, 'Invalid user ID');
        }

        const user = await User.findById(id);
        console.log('User lookup result:', { found: !!user, userId: id, userRole: user?.role });
        
        if (!user) {
            console.log('User not found for ID:', id);
            return notFound(res, 'User not found');
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            console.log('Admin attempted to delete themselves:', req.user._id);
            return badRequest(res, 'You cannot delete your own account');
        }

        // Prevent deletion of the last admin
        if (user.role === 'ADMIN') {
            const adminCount = await User.countDocuments({ role: 'ADMIN' });
            console.log('Admin count check:', { currentAdminCount: adminCount, attemptingToDeleteAdmin: true });
            if (adminCount <= 1) {
                console.log('Cannot delete last admin user');
                return badRequest(res, 'Cannot delete the last admin user');
            }
        }

        console.log('Proceeding with user deletion for ID:', id);
        await User.findByIdAndDelete(id);
        console.log('User successfully deleted:', id);
        return success(res, 'User deleted successfully');
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return onError(res, error);
    }
};