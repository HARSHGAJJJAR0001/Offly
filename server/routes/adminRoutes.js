import express from "express";
import {
    createDepartment,
    getDepartments,
    getStats,
    getWeeklyLeaves,
    getActivityLogs,
    getDepartmentAnalytics,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();
const admin = [authMiddleware, roleMiddleware("admin")];

router.post("/department", ...admin, createDepartment);
router.get("/departments", ...admin, getDepartments);
router.get("/stats", ...admin, getStats);
router.get("/weekly-leaves", ...admin, getWeeklyLeaves);
router.get("/activity-logs", ...admin, getActivityLogs);
router.get("/department-analytics", ...admin, getDepartmentAnalytics);

export default router;