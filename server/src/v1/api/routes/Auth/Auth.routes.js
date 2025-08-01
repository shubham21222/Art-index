import express from "express";
import  {register, login , logout , verifyUser , forgotPassword , resetPassword , updateProfile , updatePassword , updateBillingAddress , getAllUsers , getUserById , getUserByBillingAddress, verifyEmail, createPassword, getCurrentUser}  from  "../../controllers/AuthController/auth.controller.js";
import { IsAuthenticated ,  authorizeRoles} from  "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify/:token", verifyUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/create-password/:token", createPassword);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);
router.post("/updateProfile",  IsAuthenticated , authorizeRoles('USER') ,updateProfile);
router.post("/updatePassword",  IsAuthenticated , authorizeRoles('USER') ,updatePassword);
router.post("/UpdateBillingAddress" , IsAuthenticated , updateBillingAddress)
router.get("/me", IsAuthenticated, getCurrentUser);
router.get("/getAllUsers", IsAuthenticated , authorizeRoles('ADMIN') , getAllUsers);
router.get("/getUserById/:id", IsAuthenticated  , getUserById);
router.get("/getUserByBillingAddress/:id" , getUserByBillingAddress);

export default router;