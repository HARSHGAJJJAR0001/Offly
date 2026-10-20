import Leave from "../models/Leave.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendLeaveStatusEmail } from "../utils/emailService.js";

// POST /api/leaves
export const applyLeave = async (req, res) => {
    try {
        const { departmentId, leaveType, startDate, endDate, reason } = req.body;
        const leave = new Leave({
            userId: req.user.id,
            departmentId: departmentId || req.user.departmentId,
            leaveType, startDate, endDate, reason,
        });
        await leave.save();
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/leaves?page=1&limit=10&status=&department=&search=
export const getLeaves = async (req, res) => {
    try {
        const {
            status, department, search,
            page = 1,
            limit = 10,
            sort = "createdAt",
            order = "desc",
        } = req.query;

        let query = {};
        if (req.user.role === "manager") query.departmentId = req.user.departmentId;
        if (status) query.status = status;
        if (department && req.user.role !== "manager") query.departmentId = department;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const sortObj = { [sort]: order === "asc" ? 1 : -1 };

        let [leaves, total] = await Promise.all([
            Leave.find(query)
                .populate("userId", "name email")
                .populate("departmentId", "name")
                .populate("reviewedBy", "name")
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum),
            Leave.countDocuments(query),
        ]);

        // Search by employee name (post-populate filter)
        if (search) {
            leaves = leaves.filter(l =>
                l.userId?.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            data: leaves,
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

// GET /api/leaves/my?page=1&limit=10
export const getMyLeaves = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = "createdAt",
            order = "desc",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const sortObj = { [sort]: order === "asc" ? 1 : -1 };
        const query = { userId: req.user.id };

        const [leaves, total] = await Promise.all([
            Leave.find(query)
                .populate("departmentId", "name")
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum),
            Leave.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            data: leaves,
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

// PUT /api/leaves/approve/:id
export const approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status: "approved", reviewedBy: req.user._id, reviewedAt: new Date() },
            { new: true }
        ).populate("userId", "name email");

        await ActivityLog.create({ action: `Approved leave for "${leave.userId?.name}"`, performedBy: req.user._id, targetModel: "Leave", targetId: leave._id });
        if (leave.userId?.email) await sendLeaveStatusEmail({ to: leave.userId.email, name: leave.userId.name, status: "approved", leaveType: leave.leaveType, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /api/leaves/reject/:id
export const rejectLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status: "rejected", reviewedBy: req.user._id, reviewedAt: new Date() },
            { new: true }
        ).populate("userId", "name email");

        await ActivityLog.create({ action: `Rejected leave for "${leave.userId?.name}"`, performedBy: req.user._id, targetModel: "Leave", targetId: leave._id });
        if (leave.userId?.email) await sendLeaveStatusEmail({ to: leave.userId.email, name: leave.userId.name, status: "rejected", leaveType: leave.leaveType, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /api/leaves/:id
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status))
            return res.status(400).json({ message: "Status must be approved or rejected" });

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, reviewedBy: req.user._id, reviewedAt: new Date() },
            { new: true }
        ).populate("userId", "name email");

        if (!leave) return res.status(404).json({ message: "Leave not found" });

        await ActivityLog.create({ action: `${status.charAt(0).toUpperCase() + status.slice(1)} leave for "${leave.userId?.name}"`, performedBy: req.user._id, targetModel: "Leave", targetId: leave._id });
        if (leave.userId?.email) await sendLeaveStatusEmail({ to: leave.userId.email, name: leave.userId.name, status, leaveType: leave.leaveType, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /api/leaves/:id
export const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: "Leave not found" });
        if (leave.userId.toString() !== req.user._id.toString() && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });
        if (leave.status !== "pending" && req.user.role !== "admin")
            return res.status(400).json({ message: "Cannot delete an already reviewed leave" });
        await Leave.findByIdAndDelete(req.params.id);
        res.json({ message: "Leave deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};