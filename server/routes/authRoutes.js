import express from "express";
import {
    login, getMe, changePassword,
    forgotPassword, verifyOTP, resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    validate,
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    verifyOTPValidator,
    resetPasswordValidator,
} from "../middleware/Validators.js";

const router = express.Router();

// Public
router.post("/login", loginValidator, validate, login);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/verify-otp", verifyOTPValidator, validate, verifyOTP);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

// Protected
router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePasswordValidator, validate, changePassword);

export default router;