import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// GET /api/employees?page=1&limit=10&search=&department=&role=
export const getAllEmployees = async (req, res) => {
    try {
        const {
            search, department, role,
            page = 1,
            limit = 10,
            sort = "createdAt",
            order = "desc",
        } = req.query;

        const query = { role: { $in: ["employee", "manager"] } };

        // Manager sees only their dept
        if (req.user.role === "manager") {
            query.departmentId = req.user.departmentId;
        } else {
            if (department) query.departmentId = department;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role) query.role = role;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const sortObj = { [sort]: order === "asc" ? 1 : -1 };

        const [employees, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .populate("departmentId", "name")
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            data: employees,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/employees/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("departmentId", "name");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /api/employees/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true }
        ).select("-password").populate("departmentId", "name");
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
    try {
        const emp = await User.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "Employee not found" });

        if (req.user.role === "manager") {
            const managerDeptId = req.user.departmentId?.toString();
            const empDeptId = emp.departmentId?.toString();
            if (!managerDeptId || managerDeptId !== empDeptId)
                return res.status(403).json({ message: "You can only delete employees from your own department" });
            if (emp.role === "manager")
                return res.status(403).json({ message: "Managers cannot delete other managers" });
        }

        await User.findByIdAndDelete(req.params.id);
        await ActivityLog.create({
            action: `Deleted employee "${emp.name}"`, performedBy: req.user._id,
            targetModel: "User", targetId: emp._id,
            details: `Employee "${emp.name}" (${emp.email}) removed by ${req.user.role}`,
        });
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        const emp = await User.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "Employee not found" });

        if (req.user.role === "manager") {
            const managerDeptId = req.user.departmentId?.toString();
            const empDeptId = emp.departmentId?.toString();
            if (!managerDeptId || managerDeptId !== empDeptId)
                return res.status(403).json({ message: "You can only update employees from your own department" });
            delete req.body.role;
            delete req.body.departmentId;
        }

        const { name, email, phone, departmentId, role } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, ...(departmentId && { departmentId }), ...(role && { role }) },
            { new: true }
        ).select("-password").populate("departmentId", "name");

        await ActivityLog.create({
            action: `Updated employee "${emp.name}"`, performedBy: req.user._id,
            targetModel: "User", targetId: emp._id,
            details: `Employee "${emp.name}" updated by ${req.user.role}`,
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /api/employees
export const addEmployee = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const departmentId = req.user.role === "manager"
            ? req.user.departmentId
            : req.body.departmentId;

        if (!departmentId)
            return res.status(400).json({ message: "Department is required" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const plainPassword = password?.trim() || Math.random().toString(36).slice(-6).toUpperCase() + "1@";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const employee = new User({
            name, email, password: hashedPassword,
            role: role || "employee", departmentId,
            mustChangePassword: true,
        });
        await employee.save();

        await ActivityLog.create({
            action: `Added employee "${name}"`, performedBy: req.user._id,
            targetModel: "User", targetId: employee._id,
            details: `Employee "${name}" (${email}) added by ${req.user.role}`,
        });

        try {
            const { sendWelcomeEmail } = await import("../utils/emailService.js");
            await sendWelcomeEmail({ name, email, password: plainPassword, role: role || "employee" });
        } catch (e) { console.error("Email error:", e.message); }

        res.json({
            employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
            temporaryPassword: plainPassword,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};