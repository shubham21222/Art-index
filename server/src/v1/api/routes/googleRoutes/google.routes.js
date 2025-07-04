import express from "express";
import passport from "passport";
import { handleGoogleCallback } from "../../controllers/AuthController/google.controller.js";

const router = express.Router();

// Test route to check if Google OAuth is configured
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Google OAuth routes are working',
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://artindex.ai/v1/api/googleAuth/google/callback'
  });
});

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/v1/api/googleAuth/failure' }),
  handleGoogleCallback
);

export default router;
