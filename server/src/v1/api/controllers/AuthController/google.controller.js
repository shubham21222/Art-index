import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { generateToken } from '../../config/jwt.js'
import User from "../../models/Auth/User.js";



passport.use(
  new GoogleStrategy(
    {
      clientID: "598798693334-ko4vpcpme44qinuptcobkvlevflierrn.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: 'https://artindex.ai/v1/api/googleAuth/google/callback',
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

        const token = generateToken(user?._id || null, "User");

        if (user) {

          if (!user.googleId) {
            user.googleId = profile.id;
          }

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


        console.log("New user created:", newUser);

        await User.findByIdAndUpdate(newUser._id, { activeToken: token });

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
      clientId: "554991212090-gd8lhhtei00a8gi6putq5qjfta3uam9v.apps.googleusercontent.com",
      clientSecret: "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",
      scope: ["profile", "email"], // replace with actual needed scopes
      callbackURL: "https://artindex.ai/v1/api/googleAuth/google/callback", // this should match your Google console settings
      successRedirectUrl: "https://artindex.ai/auth/success", // customize this as needed
      failureRedirectUrl: "https://artindex.ai/auth/failure"  // customize this as needed
    }
  };
};



// Handle Google authentication response
export const handleGoogleCallback = async (req, res) => {
  try {
    const { user } = req.user;

    // Load redirect URLs from DB config
    const config = await getConfig();
    const failureRedirectUrl = "https://artindex.ai/";
    const successRedirectUrl = "https://artindex.ai/";



    if (!user) {
      return res.redirect(`${failureRedirectUrl}?error=AuthenticationFailed`);
    }



    const dbUser = await User.findById(user._id);

    // Check if user has custom success redirect, fallback to portal config
    const redirectUrl =  successRedirectUrl;

    return res.redirect(`${redirectUrl}?token=${dbUser.activeToken}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    const config = await getConfig();
    const failureRedirectUrl = config.google.failureRedirectUrl || "https://candidate-portal.fincooperstech.com/login";
    return res.redirect(`${failureRedirectUrl}?error=ServerError`);
  }
};



export default passport;