import express from "express";
import {
    createInquiry,
    getAllInquiries,
    getSingleInquiry,
    updateInquiry,
    deleteInquiry
} from "../../controllers/InquiryController/inquiry.controller.js";
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"

const router = express.Router();

router.post("/", createInquiry);
router.get("/",IsAuthenticated , authorizeRoles('ADMIN'), getAllInquiries);
router.get("/:id", IsAuthenticated , authorizeRoles('ADMIN'),getSingleInquiry);
router.put("/:id", IsAuthenticated , authorizeRoles('ADMIN'), updateInquiry);
router.delete("/:id", IsAuthenticated , authorizeRoles('ADMIN'), deleteInquiry);

export default router;
