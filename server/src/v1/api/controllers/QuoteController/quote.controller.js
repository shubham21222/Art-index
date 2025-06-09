import QuoteModel from "../../models/Quote/quote.model.js";
import {
    success,
    created,
    notFound,
    badRequest,
    sendResponse,
    unknownError,
    isValidObjectId
} from "../../formatters/globalResponse.js";

// Create a new quote request
export const createQuote = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, location, reasonForPartnering } = req.body;

        // Validate required fields
        if (!firstName || !email || !location || !reasonForPartnering) {
            return badRequest(res, "All required fields must be provided.");
        }

        // Create quote request
        const quote = await QuoteModel.create({
            firstName,
            lastName,
            email,
            phone,
            location,
            reasonForPartnering
        });

        return created(res, "Quote request submitted successfully.", quote);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get all quote requests
export const getAllQuotes = async (req, res) => {
    try {
        const quotes = await QuoteModel.find().sort({ createdAt: -1 });
        return success(res, "List of quote requests", quotes);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Get a single quote request
export const getSingleQuote = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const quote = await QuoteModel.findById(req.params.id);
        if (!quote) {
            return notFound(res, "Quote request not found");
        }

        return success(res, "Quote request details", quote);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Update a quote request
export const updateQuote = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const { firstName, lastName, email, phone, location, reasonForPartnering } = req.body;

        // Validate required fields
        if (!firstName || !email || !location || !reasonForPartnering) {
            return badRequest(res, "All required fields must be provided.");
        }

        const quote = await QuoteModel.findById(req.params.id);
        if (!quote) {
            return notFound(res, "Quote request not found");
        }

        const updatedQuote = await QuoteModel.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, phone, location, reasonForPartnering },
            { new: true, runValidators: true }
        );

        return success(res, "Quote request updated successfully", updatedQuote);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// Delete a quote request
export const deleteQuote = async (req, res) => {
    try {
        if (!(await isValidObjectId(res, req.params.id))) return;

        const quote = await QuoteModel.findById(req.params.id);
        if (!quote) {
            return notFound(res, "Quote request not found");
        }

        await QuoteModel.findByIdAndDelete(req.params.id);
        return sendResponse(res, "Quote request deleted successfully");
    } catch (error) {
        return unknownError(res, error.message);
    }
};
