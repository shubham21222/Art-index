import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { generateToken } from '../../config/jwt.js'
import User from "../../models/Auth/User.js";

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "554991212090-gd8lhhtei00a8gi6putq5qjfta3uam9v.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://artindex.ai/v1/api/googleAuth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
          }

          // Generate token for existing user
          const token = generateToken(user._id);
          
          // Update token
          user.activeToken = token;
          await user.save();

          return done(null, { user, token });
        }

        // If user doesn't exist, create a new user
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          img: profile.photos[0].value,
        });

        // Generate token for new user
        const token = generateToken(newUser._id);
        
        // Update the new user with the token
        newUser.activeToken = token;
        await newUser.save();

        console.log("New user created:", newUser);

        return done(null, { user: newUser, token });
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }
  )
);



export const getConfig = async () => {
  return {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "554991212090-gd8lhhtei00a8gi6putq5qjfta3uam9v.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      scope: ["profile", "email"],
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://artindex.ai/v1/api/googleAuth/google/callback",
      successRedirectUrl: process.env.FRONTEND_URL || "https://artindex.ai",
      failureRedirectUrl: process.env.FRONTEND_URL || "https://artindex.ai"
    }
  };
};



// Handle Google authentication response
export const handleGoogleCallback = async (req, res) => {
  try {
    console.log("Google callback received:", req.user);
    
    if (!req.user || !req.user.user) {
      console.error("No user data in callback");
      const failureRedirectUrl = process.env.FRONTEND_URL || "https://artindex.ai";
      return res.redirect(`${failureRedirectUrl}?error=AuthenticationFailed`);
    }

    const { user, token } = req.user;
    const config = await getConfig();
    const successRedirectUrl = config.google.successRedirectUrl;
    const failureRedirectUrl = config.google.failureRedirectUrl;

    if (!user) {
      console.error("No user found in callback data");
      return res.redirect(`${failureRedirectUrl}?error=AuthenticationFailed`);
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      console.error("User not found in database");
      return res.redirect(`${failureRedirectUrl}?error=UserNotFound`);
    }

    console.log("Redirecting to:", `${successRedirectUrl}?token=${dbUser.activeToken}`);
    return res.redirect(`${successRedirectUrl}?token=${dbUser.activeToken}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    const failureRedirectUrl = process.env.FRONTEND_URL || "https://artindex.ai";
    return res.redirect(`${failureRedirectUrl}?error=ServerError`);
  }
};



export default passport;