import Department from "../models/Department.js";
import User from "../models/User.js";
import Leave from "../models/Leave.js";
import ActivityLog from "../models/ActivityLog.js";

// ── Helper: get current + previous period boundaries ─────────────────────────
const getPeriodBounds = (range) => {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd, label;

    switch (range) {
        case "day":
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
            label = "vs yesterday";
            break;
        case "week":
            const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7, 23, 59, 59);
            previousStart = new Date(currentStart); previousStart.setDate(currentStart.getDate() - 7);
            previousEnd = new Date(currentEnd); previousEnd.setDate(currentEnd.getDate() - 7);
            label = "vs last week";
            break;
        case "year":
            currentStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            previousStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
            previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            label = "vs last year";
            break;
        default: // month
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            label = "vs last month";
            break;
    }

    return { currentStart, currentEnd, previousStart, previousEnd, label };
};

const calcTrend = (current, previous) => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
};

// GET /api/admin/stats?range=day|week|month|year
export const getStats = async (req, res) => {
    try {
        const range = req.query.range || "month";
        const { currentStart, currentEnd, previousStart, previousEnd, label } = getPeriodBounds(range);

        const [
            totalEmployees, totalDepartments,
            pendingLeaves, approvedLeaves, rejectedLeaves, totalLeaves,
        ] = await Promise.all([
            User.countDocuments({ role: { $in: ["employee", "manager"] } }),
            Department.countDocuments(),
            Leave.countDocuments({ status: "pending" }),
            Leave.countDocuments({ status: "approved" }),
            Leave.countDocuments({ status: "rejected" }),
            Leave.countDocuments(),
        ]);

        const [empCurrent, deptCurrent, pendingCurrent, approvedCurrent] = await Promise.all([
            User.countDocuments({ role: { $in: ["employee", "manager"] }, createdAt: { $gte: currentStart, $lte: currentEnd } }),
            Department.countDocuments({ createdAt: { $gte: currentStart, $lte: currentEnd } }),
            Leave.countDocuments({ status: "pending", createdAt: { $gte: currentStart, $lte: currentEnd } }),
            Leave.countDocuments({ status: "approved", createdAt: { $gte: currentStart, $lte: currentEnd } }),
        ]);

        const [empPrevious, deptPrevious, pendingPrevious, approvedPrevious] = await Promise.all([
            User.countDocuments({ role: { $in: ["employee", "manager"] }, createdAt: { $gte: previousStart, $lte: previousEnd } }),
            Department.countDocuments({ createdAt: { $gte: previousStart, $lte: previousEnd } }),
            Leave.countDocuments({ status: "pending", createdAt: { $gte: previousStart, $lte: previousEnd } }),
            Leave.countDocuments({ status: "approved", createdAt: { $gte: previousStart, $lte: previousEnd } }),
        ]);

        res.json({
            totalEmployees, totalDepartments,
            pendingLeaves, approvedLeaves, rejectedLeaves, totalLeaves,
            trends: {
                employees: calcTrend(empCurrent, empPrevious),
                departments: calcTrend(deptCurrent, deptPrevious),
                pending: calcTrend(pendingCurrent, pendingPrevious),
                approved: calcTrend(approvedCurrent, approvedPrevious),
            },
            trendLabel: label,
            current: { employees: empCurrent, departments: deptCurrent, pending: pendingCurrent, approved: approvedCurrent },
            previous: { employees: empPrevious, departments: deptPrevious, pending: pendingPrevious, approved: approvedPrevious },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/admin/weekly-leaves — real data per day for this week
export const getWeeklyLeaves = async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0);

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const result = [];

        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(weekStart);
            dayStart.setDate(weekStart.getDate() + i);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const count = await Leave.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd },
            });

            result.push({
                label: days[i],
                value: count,
                date: dayStart.toISOString().split("T")[0],
                // mark today
                isToday: i === dayOfWeek - 1,
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /api/admin/department
export const createDepartment = async (req, res) => {
    try {
        const { name, managerId } = req.body;
        const department = new Department({ name, managerId });
        await department.save();
        await ActivityLog.create({ action: `Created department "${name}"`, performedBy: req.user._id, targetModel: "Department", targetId: department._id });
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/admin/departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate("managerId", "name email");
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/admin/activity-logs
export const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate("performedBy", "name email role")
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/admin/department-analytics
export const getDepartmentAnalytics = async (req, res) => {
    try {
        const departments = await Department.find().populate("managerId", "name");

        const analytics = await Promise.all(
            departments.map(async (dept) => {
                const [
                    totalEmployees, managers,
                    pendingLeaves, approvedLeaves, rejectedLeaves,
                ] = await Promise.all([
                    User.countDocuments({ departmentId: dept._id, role: { $in: ["employee", "manager"] } }),
                    User.countDocuments({ departmentId: dept._id, role: "manager" }),
                    Leave.countDocuments({ departmentId: dept._id, status: "pending" }),
                    Leave.countDocuments({ departmentId: dept._id, status: "approved" }),
                    Leave.countDocuments({ departmentId: dept._id, status: "rejected" }),
                ]);

                // Last 6 months trend
                const monthlyTrend = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    const start = new Date(d.getFullYear(), d.getMonth() - i, 1);
                    const end = new Date(d.getFullYear(), d.getMonth() - i + 1, 0, 23, 59, 59);
                    const count = await Leave.countDocuments({
                        departmentId: dept._id,
                        createdAt: { $gte: start, $lte: end },
                    });
                    monthlyTrend.push({
                        month: start.toLocaleString("en-US", { month: "short" }),
                        leaves: count,
                    });
                }

                return {
                    id: dept._id,
                    name: dept.name,
                    manager: dept.managerId?.name || "No Manager",
                    totalEmployees,
                    managers,
                    employees: totalEmployees - managers,
                    leaves: {
                        pending: pendingLeaves,
                        approved: approvedLeaves,
                        rejected: rejectedLeaves,
                        total: pendingLeaves + approvedLeaves + rejectedLeaves,
                    },
                    monthlyTrend,
                };
            })
        );

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};