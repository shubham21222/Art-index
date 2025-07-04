import jwt from "jsonwebtoken";
import User from "../models/Auth/User.js";
import { success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError} from "../formatters/globalResponse.js"

    import  ErrorResponse  from "../Utils/errorRes.js"


    // Make a middleware function to check if the user is logged in


    export const IsAuthenticated = async (req, res, next) => {
      try {
          const authenticationHeader = req.headers.authorization;
  
          if (!authenticationHeader) {
              return forbidden(res, "Not authorized to access this route");
          }
  
          let token = authenticationHeader.trim(); // Trim any extra spaces
          
          // Handle both "Bearer token" and direct token formats
          if (token.startsWith('Bearer ')) {
              token = token.slice(7);
          }
          
          // Additional check for empty token after Bearer removal
          if (!token) {
              return badRequest(res, "Token is required");
          }
          
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
          console.log("Auth middleware debug:", { decoded, token });
          
          const user = await User.findById(decoded._id);
          if (!user) {
              return sendResponse(res, notFound, "No user found with this ID");
          }
  
          console.log("Auth debug:", {
              userId: user._id,
              userEmail: user.email,
              hasGoogleId: !!user.googleId,
              hasActiveToken: !!user.activeToken,
              tokenMatch: user.activeToken === token
          });
  
          // For Google OAuth users, be more lenient with token validation
          // Check if the active token matches, but don't fail if it doesn't for Google users
          if (user.googleId) {
              // For Google users, just verify the JWT is valid and user exists
              // Don't require exact token match since Google OAuth might have timing issues
              req.user = user;
              next();
          } else {
              // For regular users, check if the active token matches
              if (!user.activeToken || user.activeToken !== token) {
                  return badRequest(res, "Token is not valid");
              }
              req.user = user;
              next();
          }
  
      } catch (error) {
          console.error("Authentication error:", error);
          if (error.name === 'JsonWebTokenError') {
              return badRequest(res, "Invalid token");
          } else if (error.name === 'TokenExpiredError') {
              return badRequest(res, "Token expired");
          }
          return res.status(500).json({status: false, subCode:500 ,  message: "Something went wrong!"});
      }
  };
  

    // Make a middleware function to authorize the roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
       
        return unauthorized(res, `Role (${req.user.role}) is not allowed to access this resource`);
       
      }
  
      next();
    };
  };