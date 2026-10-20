import express from "express";
import {
    applyLeave, getLeaves, getMyLeaves,
    approveLeave, rejectLeave, updateLeaveStatus, deleteLeave,
} from "../controllers/leaveController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
    validate,
    applyLeaveValidator,
    updateLeaveStatusValidator,
} from "../middleware/Validators.js";

const router = express.Router();

router.post("/", authMiddleware, applyLeaveValidator, validate, applyLeave);
router.get("/", authMiddleware, roleMiddleware("admin", "manager"), getLeaves);
router.get("/my", authMiddleware, getMyLeaves);
router.put("/approve/:id", authMiddleware, roleMiddleware("admin", "manager"), approveLeave);
router.put("/reject/:id", authMiddleware, roleMiddleware("admin", "manager"), rejectLeave);
router.patch("/:id", authMiddleware, roleMiddleware("admin", "manager"), updateLeaveStatusValidator, validate, updateLeaveStatus);
router.delete("/:id", authMiddleware, deleteLeave);

export default router;