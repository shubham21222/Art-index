import { Router } from 'express';
import User from "./routes/Auth/Auth.routes.js";
import Category from "./routes/Category/category.routes.js";
import  uploadImage  from "./routes/upload/uploadRoutes.js";
import Products  from "./routes/Product/product.routes.js"
import favorite from "./routes/Favorite/favorite.routes.js";
import Auction from "./routes/Auction/auction.routes.js";
import Order from "./routes/order/order.routes.js"
import seller from "./routes/Seller/seller.routes.js"
import Inquiry from "./routes/Inquiry/inquiry.routes.js"
import Quote from "./routes/Quote/quote.routes.js"
import Partnership from "./routes/Partnership/partnership.routes.js";
import Museum from "./routes/Museum/museum.routes.js";
import ArtworkPricing from "./routes/ArtworkPricing/artworkPricing.routes.js";
import offerRoutes from './routes/Offer/offer.routes.js';
import SponsorBanner from './routes/SponsorBanner/sponsorBanner.routes.js';
import Newsletter from './routes/Newsletter/index.js';
import Users from './routes/users/users.routes.js';
import Dashboard from './routes/dashboard/dashboard.routes.js';

import google from "./routes/googleRoutes/google.routes.js";
import Gallery from "./routes/gallery/gallery.routes.js";

const router = Router();


// Add API routes here for REGISTER //

router.use("/auth", User);


// Add API routes here for GOOGLE AUTH //
router.use("/googleAuth", google);


// Add API routes here for CATEGORY //
router.use("/category", Category);


// Add API routes here for UPLOAD //
router.use("/uploadImg", uploadImage);


// Add API routes here for PRODUCT //
router.use("/product", Products);


// Add API routes here for FAVORITE //

router.use("/favorite", favorite);


// Add API routes here for AUCTION //
router.use("/auction", Auction);


// Add API routes here for Order //

router.use("/order" , Order)

// Add API routes here for Seller //

router.use("/seller", seller);

router.use("/inquiry", Inquiry);
router.use("/quote", Quote);

// Add API routes here for PARTNERSHIP //
router.use("/partnership", Partnership);

// Add API routes here for GALLERY //
router.use("/gallery", Gallery);

// Add API routes here for MUSEUM //
router.use("/museum", Museum);

// Add API routes here for ARTWORK PRICING //
router.use("/artwork-pricing", ArtworkPricing);

// Add API routes here for OFFER //
router.use('/offer', offerRoutes);

// Add API routes here for SPONSOR BANNER //
router.use('/sponsor-banner', SponsorBanner);

// Add API routes here for NEWSLETTER //
router.use('/newsletter', Newsletter);

// Add API routes here for USERS //
router.use('/users', Users);

// Add API routes here for DASHBOARD //
router.use('/dashboard', Dashboard);


export default router;