import { body, validationResult } from "express-validator";

// ── Helper — run validation and return errors ─────────────────────────────────
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg, // return first error only (clean UX)
            errors: errors.array(),
        });
    }
    next();
};

// ── Auth validators ───────────────────────────────────────────────────────────

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
];

export const changePasswordValidator = [
    body("currentPassword")
        .trim()
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .trim()
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
        .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter"),
];

export const forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),
];

export const verifyOTPValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
        .isNumeric().withMessage("OTP must contain numbers only"),
];

export const resetPasswordValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
        .isNumeric().withMessage("OTP must contain numbers only"),

    body("newPassword")
        .trim()
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
        .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter"),
];

// ── Department validators ─────────────────────────────────────────────────────

export const createDepartmentValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Department name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Department name must be 2–50 characters")
        .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage("Department name contains invalid characters"),
];

// ── Employee validators ───────────────────────────────────────────────────────

export const addEmployeeValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Employee name is required")
        .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .optional()
        .trim()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("role")
        .optional()
        .isIn(["employee", "manager"]).withMessage("Role must be employee or manager"),
];

export const updateEmployeeValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),

    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("phone")
        .optional()
        .trim()
        .matches(/^[+\d\s\-()]{7,20}$/).withMessage("Invalid phone number format"),
];

// ── Leave validators ──────────────────────────────────────────────────────────

export const applyLeaveValidator = [
    body("leaveType")
        .trim()
        .notEmpty().withMessage("Leave type is required")
        .isIn(["sick", "casual", "earned", "maternity", "paternity", "other"])
        .withMessage("Invalid leave type"),

    body("startDate")
        .notEmpty().withMessage("Start date is required")
        .isISO8601().withMessage("Invalid start date format")
        .custom((value) => {
            if (new Date(value) < new Date(new Date().toDateString())) {
                throw new Error("Start date cannot be in the past");
            }
            return true;
        }),

    body("endDate")
        .notEmpty().withMessage("End date is required")
        .isISO8601().withMessage("Invalid end date format")
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.startDate)) {
                throw new Error("End date cannot be before start date");
            }
            return true;
        }),

    body("reason")
        .trim()
        .notEmpty().withMessage("Reason is required")
        .isLength({ min: 5, max: 500 }).withMessage("Reason must be 5–500 characters"),
];

export const updateLeaveStatusValidator = [
    body("status")
        .trim()
        .notEmpty().withMessage("Status is required")
        .isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
];

// ── Profile update validator ──────────────────────────────────────────────────

export const updateProfileValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),

    body("phone")
        .optional()
        .trim()
        .matches(/^[+\d\s\-()]{7,20}$/).withMessage("Invalid phone number format"),
];