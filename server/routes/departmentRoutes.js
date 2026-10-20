import express from "express";
import {
    getAllDepartments, createDepartment, deleteDepartment,
    addEmployee, getDepartmentEmployees,
} from "../controllers/departmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
    validate,
    createDepartmentValidator,
    addEmployeeValidator,
} from "../middleware/Validators.js";

const router = express.Router();

router.get("/", authMiddleware, getAllDepartments);
router.post("/", authMiddleware, roleMiddleware("admin"), createDepartmentValidator, validate, createDepartment);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteDepartment);
router.post("/employee", authMiddleware, roleMiddleware("admin", "manager"), addEmployeeValidator, validate, addEmployee);
router.get("/employees/:departmentId", authMiddleware, roleMiddleware("admin", "manager"), getDepartmentEmployees);

export default router;