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






export default router;