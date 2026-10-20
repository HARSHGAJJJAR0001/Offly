// ── All React Query keys in one place ────────────────────────────────────────
// This prevents cache key typos and makes invalidation easy

export const KEYS = {
    // Admin
    stats: (range) => ["admin", "stats", range],
    weeklyLeaves: () => ["admin", "weekly-leaves"],
    activityLogs: () => ["admin", "activity-logs"],
    departments: () => ["departments"],
    department: (id) => ["departments", id],

    // Employees
    employees: (params) => ["employees", params],
    employee: (id) => ["employees", id],
    profile: () => ["employees", "profile"],

    // Leaves
    leaves: (params) => ["leaves", params],
    myLeaves: (params) => ["leaves", "my", params],

    // Auth
    me: () => ["auth", "me"],
};