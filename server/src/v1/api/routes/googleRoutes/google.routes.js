import express from "express";
import passport from "passport";
import { handleGoogleCallback } from "../../controllers/AuthController/google.controller.js";

const router = express.Router();

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/v1/api/googleAuth/failure' }),
  handleGoogleCallback
);

export default router;
