import InquiryModel from "../../models/Inquiry/inquiry.model.js";
import {
    success,
    created,
    notFound,
    badRequest,
    sendResponse,
    unknownError,
    isValidObjectId
} from "../../formatters/globalResponse.js";

// Create a new inquiry
export const createInquiry = async (req, res) => {
    try {
        const { name, itemName, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !itemName || !email || !message) {
            return badRequest(res, "All required fields must be provided.");
        }

        // Create inquiry
        const inquiry = await InquiryModel.create({
            name,
            itemName,
            email,
            phone,
            message
        });

        return created(res, "Inquiry submitted successfully.", inquiry);
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

        const { name, itemName, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !itemName || !email || !message) {
            return badRequest(res, "All required fields must be provided.");
        }

        const inquiry = await InquiryModel.findById(req.params.id);
        if (!inquiry) {
            return notFound(res, "Inquiry not found");
        }

        const updatedInquiry = await InquiryModel.findByIdAndUpdate(
            req.params.id,
            { name, itemName, email, phone, message },
            { new: true, runValidators: true }
        );

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
