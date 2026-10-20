import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Department from "../models/Department.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// GET /api/departments
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate("managerId", "name email");
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /api/departments
export const createDepartment = async (req, res) => {
    try {
        const { name, managerId } = req.body;
        const department = new Department({ name, managerId });
        await department.save();
        await ActivityLog.create({
            action: `Created department "${name}"`,
            performedBy: req.user._id,
            targetModel: "Department",
            targetId: department._id,
        });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) return res.status(404).json({ message: "Department not found" });
        await Department.findByIdAndDelete(req.params.id);
        await ActivityLog.create({
            action: `Deleted department "${dept.name}"`,
            performedBy: req.user._id,
            targetModel: "Department",
            targetId: dept._id,
        });
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /api/departments/employee
export const addEmployee = async (req, res) => {
    try {
        const { name, email, password, departmentId, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        // Auto-generate password if not provided
        const plainPassword = password?.trim() || Math.random().toString(36).slice(-6).toUpperCase() + "1@";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const employee = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "employee",
            departmentId,
            mustChangePassword: true,
        });

        await employee.save();

        await ActivityLog.create({
            action: `Added employee "${name}"`,
            performedBy: req.user._id,
            targetModel: "User",
            targetId: employee._id,
            details: `Employee "${name}" (${email}) added`,
        });

        // Send real welcome email with credentials
        const emailSent = await sendWelcomeEmail({
            name,
            email,
            password: plainPassword,
            role: role || "employee",
        });

        res.json({
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
            },
            temporaryPassword: plainPassword,
            emailSent,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/departments/employees/:departmentId
export const getDepartmentEmployees = async (req, res) => {
    try {
        const employees = await User.find({ departmentId: req.params.departmentId })
            .select("-password")
            .populate("departmentId", "name");
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};