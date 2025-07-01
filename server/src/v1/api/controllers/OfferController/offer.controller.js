import Offer from '../../models/Offer/offer.model.js';
import User from '../../models/Auth/User.js';
import Product from '../../models/Products/product.model.js';
// import nodemailer or your email utility here

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
    // TODO: send acceptance email to offer.user.email
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
    // TODO: send rejection email to offer.user.email
    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 