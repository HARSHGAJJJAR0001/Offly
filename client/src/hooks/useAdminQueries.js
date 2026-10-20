import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { KEYS } from "./queryKeys";

// ── Admin Stats ───────────────────────────────────────────────────────────────
export const useAdminStats = (range = "month") =>
    useQuery({
        queryKey: KEYS.stats(range),
        queryFn: () => API.get(`/admin/stats?range=${range}`).then(r => r.data),
        staleTime: 1000 * 60, // 1 min fresh
    });

// ── Weekly Leaves ─────────────────────────────────────────────────────────────
export const useWeeklyLeaves = () =>
    useQuery({
        queryKey: KEYS.weeklyLeaves(),
        queryFn: () => API.get("/admin/weekly-leaves").then(r => r.data),
        staleTime: 1000 * 60 * 5, // 5 min fresh
    });

// ── Activity Logs ─────────────────────────────────────────────────────────────
export const useActivityLogs = () =>
    useQuery({
        queryKey: KEYS.activityLogs(),
        queryFn: () => API.get("/admin/activity-logs").then(r => r.data),
        staleTime: 1000 * 30, // 30 sec fresh
    });

// ── Departments ───────────────────────────────────────────────────────────────
export const useDepartments = () =>
    useQuery({
        queryKey: KEYS.departments(),
        queryFn: () => API.get("/departments").then(r => r.data),
        staleTime: 1000 * 60 * 5,
    });

// ── Create Department ─────────────────────────────────────────────────────────
export const useCreateDepartment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => API.post("/departments", data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.departments() }),
    });
};

// ── Delete Department ─────────────────────────────────────────────────────────
export const useDeleteDepartment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => API.delete(`/departments/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.departments() }),
    });
};