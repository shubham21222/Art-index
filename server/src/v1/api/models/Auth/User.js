import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { success,
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
    onError} from "../../formatters/globalResponse.js"
import { type } from "os";
import order from "../Order/order.js";



const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: false
    },

    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Please add a valid email",
        ],
    },

    googleId:{
        type: String,
        required: false,
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN" , "MUSICIAN", "GALLERY", "AUCTIONS", "FAIRS", "MUSEUMS", "GALLERIES"],
        default: "USER",
    },


    password: {
        type: String,
        required:false
    },

    // confirmPassword: {
    //     type: String,
    //     required: [false, "Please add a password"],
    //     validate: {
    //         validator: function (el) {
    //             return el === this.password;
    //         },
    //         message: "Passwords are not the same",
    //     },
    // },

    mobile: {
        type: String,
        required: false,
    },

    activeToken:{
        type: String,
        required: false,
    },

    img:{
        type: String,
        required: false,
    },
     // Date when the password was last changed
     passwordChangedAt: {
        type: Date,
        select: false, // Password change date won't be included in query results by default
      },
      // Token for resetting the password
      passwordResetToken:{
        type: String,
  
      },
      // Expiry date/time for the password reset token
      passwordResetExpires: {
        type: Date,
      },

      // Product connectivity //

        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false
        }],


        // Billing Details connectivity //

        BillingDetails: [{


            firstName: {
                type: String,
                required: false
            },

            lastName: {
                type: String,
                required: false
            },

            company_name: {
                type: String,
                required: false
            },

            streetAddress: {
                type: String,
                required: false
            },

            city:{
                type: String,
                required: false
            },

            state:{
                type: String,
                required: false
            },

            zipcode:{
                type: String,
                required: false
            },

            phone:{
                type: String,
                required: false
            },

            email:{
                type: String,
                required: false
            },

            orderNotes:{
                type: String,
                required: false
            }

        }],

        // Auction connectivity //

        auctions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction',
            required: false
        }],

        walletBalance: { type: Number, default: 0 }, // Default balance


        // payment connectivity //

        payments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            required: false
        }],

        Payment_Status:{
            type:String,
            enum:['PENDING','PAID','PROCESSING' ,"FAILED"],
            default:'PENDING'
        },

    // Partnership related fields
    isPartner: {
        type: Boolean,
        default: false
    },
    
    partnershipType: {
        type: String,
        enum: ['auctions', 'fairs', 'museums', 'galleries'],
        required: false
    },
    
    partnerApprovedAt: {
        type: Date,
        required: false
    },

},{
    timestamps: true,
})

// Middleware to hash the password before saving
UserSchema.pre("save", async function (next) {

    if(!this.isModified("password")){
        return next()
    }


    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()

})


UserSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password);
} 

// Method to generate and set reset password token
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Set reset token and expiry time
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Method to generate and sign JWT token for user authentication
UserSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id , role:this.role}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
};


const User = mongoose.model("User" , UserSchema)
export default User;