import express from "express";
import {
    getAllEmployees, getProfile, updateProfile,
    deleteEmployee, updateEmployee, addEmployee,
} from "../controllers/employeeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
    validate,
    addEmployeeValidator,
    updateEmployeeValidator,
    updateProfileValidator,
} from "../middleware/Validators.js";

const router = express.Router();

const adminOrManager = [authMiddleware, roleMiddleware("admin", "manager")];

router.get("/", ...adminOrManager, getAllEmployees);
router.post("/", ...adminOrManager, addEmployeeValidator, validate, addEmployee);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfileValidator, validate, updateProfile);
router.delete("/:id", ...adminOrManager, deleteEmployee);
router.put("/:id", ...adminOrManager, updateEmployeeValidator, validate, updateEmployee);

export default router;