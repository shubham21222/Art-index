import express from "express";
import {
    createQuote,
    getAllQuotes,
    getSingleQuote,
    updateQuote,
    deleteQuote
} from "../../controllers/QuoteController/quote.controller.js";

import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/", createQuote);
router.get("/",IsAuthenticated , authorizeRoles('ADMIN'), getAllQuotes);
router.get("/:id",IsAuthenticated , authorizeRoles('ADMIN'), getSingleQuote);
router.put("/:id", IsAuthenticated , authorizeRoles('ADMIN'),updateQuote);
router.delete("/:id", IsAuthenticated , authorizeRoles('ADMIN'), deleteQuote);

export default router;
